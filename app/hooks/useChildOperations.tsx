import { UseFormReturn } from "react-hook-form";
import { Active, Over } from "@dnd-kit/core";
import { Data, Child } from "../types";
import { childIdPattern, sidebarChildPattern } from "../lib/drag-patterns";

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
        const isOverChild = childIdPattern.test(overChildId);
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
                console.warn(
                    "🚨 handleChildMove: 子要素は親要素に直接ドロップできません",
                    {
                        overChildId,
                    }
                );
                return;
            }

            // コンテナIDから親IDを抽出
            const targetParentId = overChildId.replace("-container", "");

            const targetParent = parentFields.find(
                field => field.id === targetParentId
            );
            if (!targetParent) {
                console.warn("🚨 handleChildMove: 対象親要素が見つかりません", {
                    overChildId,
                    targetParentId,
                });
                return;
            }
            overParentIndex = parentFields.findIndex(
                field => field.id === targetParentId
            );

            // dropPositionがある場合は、それに基づいて挿入位置を決定
            const targetParentData = getValues(
                `parentArray.${overParentIndex}`
            );

            console.log("🎯 コンテナドロップ位置決定:", {
                targetParentId,
                overChildId,
                dropPosition,
                dropIndicatorTargetId,
                childArrayLength: targetParentData.childArray.length,
            });

            // ドロップインジケーターのターゲットが子要素の場合、その位置を使用
            if (
                dropIndicatorTargetId &&
                childIdPattern.test(dropIndicatorTargetId)
            ) {
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

        console.log("🎯 handleChildMove:", {
            activeParentIndex,
            activeChildIndex,
            overParentIndex,
            overChildIndex,
            isOverChild,
            isDropToEnd: !isOverChild,
        });

        if (activeParentIndex === overParentIndex) {
            // 同一Parent内での並び替え（既存機能）
            const currentParent = getValues(`parentArray.${activeParentIndex}`);
            const newChildArray = [...currentParent.childArray];

            // 配列内での移動
            const [movedChild] = newChildArray.splice(activeChildIndex, 1);
            newChildArray.splice(overChildIndex, 0, movedChild);

            console.log("🎯 同一Parent内移動実行:", {
                parentIndex: activeParentIndex,
                oldArray: currentParent.childArray,
                newArray: newChildArray,
            });

            // フォームに反映
            setValue(
                `parentArray.${activeParentIndex}.childArray`,
                newChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
        } else {
            // 異なるParent間での移動（新機能）
            console.log("🎯 異なるParent間移動実行:", {
                fromParent: activeParentIndex,
                fromChild: activeChildIndex,
                toParent: overParentIndex,
                toChild: overChildIndex,
                isDropToEnd: !isOverChild,
            });

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

            console.log("🎯 異なるParent間移動データ:", {
                movedChild,
                sourceOld: sourceParent.childArray,
                sourceNew: newSourceChildArray,
                targetOld: targetParent.childArray,
                targetNew: newTargetChildArray,
            });

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

        console.log("🎯 サイドバー: 位置指定挿入処理", {
            activeParentIndex,
            activeChildIndex,
            targetParentIndex,
            dropPosition,
        });

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

            console.log("🎯 サイドバー: 同一Parent内移動実行", {
                oldArray: currentParent.childArray,
                newArray: newChildArray,
                dropPosition,
            });

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

            console.log("🎯 サイドバー: 異なるParent間位置指定移動実行", {
                sourceParentIndex: activeParentIndex,
                targetParentIndex,
                movedChild,
                dropPosition,
                newSourceLength: newSourceChildArray.length,
                newTargetLength: newTargetChildArray.length,
            });

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
        const sidebarContainerPattern = /^sidebar-(.+)-container$/;
        const isOverChild = sidebarChildPattern.test(overChildId);
        const isOverContainer = sidebarContainerPattern.test(overChildId);
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
                console.warn("🚨 handleSidebarChildMove: コンテナIDが不正", {
                    overChildId,
                });
                return;
            }
            const targetParentId = containerMatch[1];
            overParentIndex = parentFields.findIndex(
                field => field.id === targetParentId
            );
            if (overParentIndex === -1) {
                console.warn(
                    "🚨 handleSidebarChildMove: 対象親要素が見つかりません",
                    { targetParentId }
                );
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
                console.warn("🚨 handleSidebarChildMove: 対象親要素IDが不正", {
                    overChildId,
                });
                return;
            }
            const targetParentId = match[1];
            overParentIndex = parentFields.findIndex(
                field => field.id === targetParentId
            );
            if (overParentIndex === -1) {
                console.warn(
                    "🚨 handleSidebarChildMove: 対象親要素が見つかりません",
                    { targetParentId }
                );
                return;
            }
            // 末尾への挿入なので、その親の子要素数を取得
            const targetParentData = getValues(
                `parentArray.${overParentIndex}`
            );
            overChildIndex = targetParentData.childArray.length;
        }

        console.log("🎯 サイドバー: handleSidebarChildMove", {
            activeParentIndex,
            activeChildIndex,
            overParentIndex,
            overChildIndex,
            isOverChild,
            isOverContainer,
        });

        if (activeParentIndex === overParentIndex) {
            // 同一Parent内での並び替え
            const currentParent = getValues(`parentArray.${activeParentIndex}`);
            const newChildArray = [...currentParent.childArray];

            // 配列内での移動
            const [movedChild] = newChildArray.splice(activeChildIndex, 1);
            newChildArray.splice(overChildIndex, 0, movedChild);

            console.log("🎯 サイドバー: 同一Parent内移動実行", {
                parentIndex: activeParentIndex,
                oldArray: currentParent.childArray,
                newArray: newChildArray,
            });

            // フォームに反映
            setValue(
                `parentArray.${activeParentIndex}.childArray`,
                newChildArray,
                { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            );
        } else {
            // 異なるParent間での移動
            console.log("🎯 サイドバー: 異なるParent間移動実行", {
                fromParent: activeParentIndex,
                fromChild: activeChildIndex,
                toParent: overParentIndex,
                toChild: overChildIndex,
            });

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

            console.log("🎯 サイドバー: 異なるParent間移動データ", {
                movedChild,
                sourceOld: sourceParent.childArray,
                sourceNew: newSourceChildArray,
                targetOld: targetParent.childArray,
                targetNew: newTargetChildArray,
            });

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
            childKey: `child${parentIndex}-${currentParent.childArray.length + 1}`,
            childValue: `Child ${parentIndex}-${currentParent.childArray.length + 1}`,
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
