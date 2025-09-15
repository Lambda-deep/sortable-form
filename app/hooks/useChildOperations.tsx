import { UseFormReturn } from "react-hook-form";
import { Active, Over } from "@dnd-kit/core";
import { Data, Child } from "../types";
import {
    isChildId,
    isSidebarChildId,
    isSidebarContainerId,
    sidebarContainerPattern,
} from "../lib/drag-patterns";

interface UseChildOperationsProps {
    form: UseFormReturn<Data>;
    parentFields: { id: string }[];
}

export const useChildOperations = ({
    form,
    parentFields,
}: UseChildOperationsProps) => {
    const { getValues, setValue } = form;

    const handleChildMove = (
        active: Active,
        over: Over,
        dropPosition?: "before" | "after",
        dropIndicatorTargetId?: string
    ) => {
        const activeChildId = active.id as string;
        const overChildId = over.id as string;

        // IDから親と子のインデックスを抽出
        const [activeParentIndex, activeChildIndex] = activeChildId
            .split("-")
            .map(Number);

        // overの種類を判定（子要素か親要素か）
        const isOverChild = isChildId(overChildId);
        let overParentIndex: number;
        let overChildIndex: number;

        if (isOverChild) {
            // 子要素にドロップ
            [overParentIndex, overChildIndex] = overChildId
                .split("-")
                .map(Number);
        } else {
            // コンテナにドロップ（親要素への直接ドロップは無効）
            if (!overChildId.endsWith("-container")) {
                return;
            }

            // コンテナIDから親IDを抽出
            const targetParentId = overChildId.replace("-container", "");

            const targetParent = parentFields.find(
                field => field.id === targetParentId
            );
            if (!targetParent) {
                return;
            }
            overParentIndex = parentFields.findIndex(
                field => field.id === targetParentId
            );

            // dropPositionがある場合は、それに基づいて挿入位置を決定
            const targetParentData = getValues(
                `parentArray.${overParentIndex}`
            );

            // ドロップインジケーターのターゲットが子要素の場合、その位置を使用
            if (dropIndicatorTargetId && isChildId(dropIndicatorTargetId)) {
                const [, targetChildIndex] = dropIndicatorTargetId
                    .split("-")
                    .map(Number);

                if (dropPosition === "before") {
                    overChildIndex = targetChildIndex;
                } else if (dropPosition === "after") {
                    overChildIndex = targetChildIndex + 1;
                } else {
                    // デフォルトは末尾
                    overChildIndex = targetParentData.childArray.length;
                }
            } else {
                // 通常のコンテナドロップ処理
                if (dropPosition === "before") {
                    // 先頭に挿入
                    overChildIndex = 0;
                } else if (dropPosition === "after") {
                    // 末尾に挿入
                    overChildIndex = targetParentData.childArray.length;
                } else {
                    // dropPositionが無い場合は末尾に挿入（デフォルト）
                    overChildIndex = targetParentData.childArray.length;
                }
            }
        }

        if (activeParentIndex === overParentIndex) {
            // 同一Parent内での並び替え（既存機能）
            const currentParent = getValues(`parentArray.${activeParentIndex}`);
            const newChildArray = [...currentParent.childArray];

            // 配列内での移動
            const [movedChild] = newChildArray.splice(activeChildIndex, 1);
            newChildArray.splice(overChildIndex, 0, movedChild);

            // フォームに反映
            setValue(
                `parentArray.${activeParentIndex}.childArray`,
                newChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
        } else {
            // 異なるParent間での移動（新機能）

            // 移動元と移動先の親要素データを取得
            const sourceParent = getValues(`parentArray.${activeParentIndex}`);
            const targetParent = getValues(`parentArray.${overParentIndex}`);

            // 移動する子要素を取得
            const movedChild = sourceParent.childArray[activeChildIndex];

            // 移動元から要素を削除
            const newSourceChildArray = [...sourceParent.childArray];
            newSourceChildArray.splice(activeChildIndex, 1);

            // 移動先に要素を挿入
            const newTargetChildArray = [...targetParent.childArray];
            newTargetChildArray.splice(overChildIndex, 0, movedChild);

            // フォームに反映（両方の親を更新）
            setValue(
                `parentArray.${activeParentIndex}.childArray`,
                newSourceChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
            setValue(
                `parentArray.${overParentIndex}.childArray`,
                newTargetChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
        }
    };

    // サイドバーChild要素移動の処理
    const handleSidebarChildToParentEnd = (
        active: Active,
        targetParentIndex: number,
        dropPosition?: "before" | "after"
    ) => {
        const activeChildId = active.id as string;

        // "sidebar-0-1" -> [0, 1] の形式でIDから親と子のインデックスを抽出
        const [activeParentIndex, activeChildIndex] = activeChildId
            .replace("sidebar-", "")
            .split("-")
            .map(Number);

        if (activeParentIndex === targetParentIndex) {
            // 同一Parent内での移動
            const currentParent = getValues(`parentArray.${activeParentIndex}`);
            const newChildArray = [...currentParent.childArray];

            // 要素を移動
            const [movedChild] = newChildArray.splice(activeChildIndex, 1);

            // dropPositionに基づいて挿入位置を決定
            if (dropPosition === "before") {
                newChildArray.unshift(movedChild); // 先頭に挿入
            } else {
                newChildArray.push(movedChild); // 末尾に挿入（デフォルト）
            }

            // フォームに反映
            setValue(
                `parentArray.${activeParentIndex}.childArray`,
                newChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
        } else {
            // 異なるParent間での移動
            const sourceParent = getValues(`parentArray.${activeParentIndex}`);
            const targetParent = getValues(`parentArray.${targetParentIndex}`);

            // 移動する子要素を取得
            const movedChild = sourceParent.childArray[activeChildIndex];

            // ソース親から削除
            const newSourceChildArray = sourceParent.childArray.filter(
                (_, index) => index !== activeChildIndex
            );

            // ターゲット親に位置指定で追加
            const newTargetChildArray = [...targetParent.childArray];
            if (dropPosition === "before") {
                newTargetChildArray.unshift(movedChild); // 先頭に挿入
            } else {
                newTargetChildArray.push(movedChild); // 末尾に挿入（デフォルト）
            }

            // 両方の親を更新
            setValue(
                `parentArray.${activeParentIndex}.childArray`,
                newSourceChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
            setValue(
                `parentArray.${targetParentIndex}.childArray`,
                newTargetChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
        }
    };

    const handleSidebarChildMove = (
        active: Active,
        over: Over,
        _dropPosition?: "before" | "after",
        _dropIndicatorTargetId?: string
    ) => {
        const activeChildId = active.id as string;
        const overChildId = over.id as string;

        // "sidebar-0-1" -> [0, 1] の形式でIDから親と子のインデックスを抽出
        const [activeParentIndex, activeChildIndex] = activeChildId
            .replace("sidebar-", "")
            .split("-")
            .map(Number);

        // overの種類を判定（子要素か、コンテナか、親要素か）
        const isOverChild = isSidebarChildId(overChildId);
        const isOverContainer = isSidebarContainerId(overChildId);
        let overParentIndex: number;
        let overChildIndex: number;

        if (isOverChild) {
            // 子要素にドロップ
            [overParentIndex, overChildIndex] = overChildId
                .replace("sidebar-", "")
                .split("-")
                .map(Number);
        } else if (isOverContainer) {
            // コンテナにドロップ（末尾挿入）
            const containerMatch = overChildId.match(sidebarContainerPattern);
            if (!containerMatch) {
                return;
            }
            const targetParentId = containerMatch[1];
            overParentIndex = parentFields.findIndex(
                field => field.id === targetParentId
            );
            if (overParentIndex === -1) {
                return;
            }
            // 末尾への挿入なので、その親の子要素数を取得
            const targetParentData = getValues(
                `parentArray.${overParentIndex}`
            );
            overChildIndex = targetParentData.childArray.length;
        } else {
            // 親要素にドロップ（末尾挿入）
            // sidebarのIDからparent indexを取得
            const sidebarParentPattern = /^sidebar-(.+)$/;
            const match = overChildId.match(sidebarParentPattern);
            if (!match) {
                return;
            }
            const targetParentId = match[1];
            overParentIndex = parentFields.findIndex(
                field => field.id === targetParentId
            );
            if (overParentIndex === -1) {
                return;
            }
            // 末尾への挿入なので、その親の子要素数を取得
            const targetParentData = getValues(
                `parentArray.${overParentIndex}`
            );
            overChildIndex = targetParentData.childArray.length;
        }

        if (activeParentIndex === overParentIndex) {
            // 同一Parent内での並び替え
            const currentParent = getValues(`parentArray.${activeParentIndex}`);
            const newChildArray = [...currentParent.childArray];

            // 配列内での移動
            const [movedChild] = newChildArray.splice(activeChildIndex, 1);
            newChildArray.splice(overChildIndex, 0, movedChild);

            // フォームに反映
            setValue(
                `parentArray.${activeParentIndex}.childArray`,
                newChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
        } else {
            // 異なるParent間での移動

            // 移動元と移動先の親要素データを取得
            const sourceParent = getValues(`parentArray.${activeParentIndex}`);
            const targetParent = getValues(`parentArray.${overParentIndex}`);

            // 移動する子要素を取得
            const movedChild = sourceParent.childArray[activeChildIndex];

            // 移動元から要素を削除
            const newSourceChildArray = [...sourceParent.childArray];
            newSourceChildArray.splice(activeChildIndex, 1);

            // 移動先に要素を挿入
            const newTargetChildArray = [...targetParent.childArray];
            newTargetChildArray.splice(overChildIndex, 0, movedChild);

            // フォームに反映（両方の親を更新）
            setValue(
                `parentArray.${activeParentIndex}.childArray`,
                newSourceChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
            setValue(
                `parentArray.${overParentIndex}.childArray`,
                newTargetChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
        }
    };

    const addChild = (parentIndex: number) => {
        const currentParent = getValues(`parentArray.${parentIndex}`);
        const newChild: Child = {
            childKey: `child${parentIndex + 1}-${currentParent.childArray.length + 1}`,
            childValue: `Child ${parentIndex + 1}-${currentParent.childArray.length + 1}`,
        };
        setValue(
            `parentArray.${parentIndex}.childArray`,
            [...currentParent.childArray, newChild],
            { shouldValidate: true, shouldDirty: true, shouldTouch: true }
        );
    };

    const removeChild = (parentIndex: number, childIndex: number) => {
        const currentParent = getValues(`parentArray.${parentIndex}`);
        const newChildArray = currentParent.childArray.filter(
            (_, index) => index !== childIndex
        );
        setValue(`parentArray.${parentIndex}.childArray`, newChildArray, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        });
    };

    return {
        handleChildMove,
        handleSidebarChildToParentEnd,
        handleSidebarChildMove,
        addChild,
        removeChild,
    };
};
