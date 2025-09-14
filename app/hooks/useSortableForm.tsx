import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
    DragEndEvent,
    DragStartEvent,
    DragOverEvent,
    useSensors,
    useSensor,
    PointerSensor,
    KeyboardSensor,
    Active,
    Over,
} from "@dnd-kit/core";
import type { Data, Child, DragState } from "../types";

const initialData: Data = {
    parentArray: [
        {
            parentKey: "parent1",
            parentValue: "Parent 1",
            childArray: [
                { childKey: "child1-1", childValue: "Child 1-1" },
                { childKey: "child1-2", childValue: "Child 1-2" },
            ],
        },
        {
            parentKey: "parent2",
            parentValue: "Parent 2",
            childArray: [{ childKey: "child2-1", childValue: "Child 2-1" }],
        },
    ],
};

export function useSortableForm() {
    const { control, register, watch, setValue, getValues, handleSubmit } =
        useForm<Data>({
            defaultValues: initialData,
        });

    const {
        fields: parentFields,
        append: appendParent,
        remove: removeParent,
        move,
    } = useFieldArray({
        control,
        name: "parentArray",
    });

    const watchedData = watch();

    // ドラッグ状態の管理
    const [dragState, setDragState] = useState<DragState>({
        activeId: null,
        draggedItem: null,
        dropIndicator: null,
        sidebarActiveId: null,
        sidebarDraggedItem: null,
    });

    // センサーの設定（フォーム用）
    const formSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px移動で開始
            },
        }),
        useSensor(KeyboardSensor)
    );

    // センサーの設定（サイドバー用）
    const sidebarSensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px移動で開始
            },
        }),
        useSensor(KeyboardSensor)
    );

    // Child ID パターンの判定
    const childIdPattern = /^\d+-\d+$/;

    // ドラッグ開始ハンドラー
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;

        console.log("📝 フォーム: ドラッグ開始", {
            activeId: active.id,
            activeType: typeof active.id,
        });

        setDragState(prev => ({
            ...prev,
            activeId: active.id as string,
        }));

        const isDraggingChild = childIdPattern.test(active.id as string);

        if (isDraggingChild) {
            const [parentIndex, childIndex] = (active.id as string)
                .split("-")
                .map(Number);
            setDragState(prev => ({
                ...prev,
                draggedItem: {
                    type: "child",
                    parentIndex,
                    childIndex,
                    data: watchedData.parentArray[parentIndex].childArray[
                        childIndex
                    ],
                },
            }));
        } else {
            const parentIndex = parentFields.findIndex(
                field => field.id === active.id
            );
            setDragState(prev => ({
                ...prev,
                draggedItem: {
                    type: "parent",
                    parentIndex,
                    data: watchedData.parentArray[parentIndex],
                },
            }));
        }
    };

    // ドラッグ中ハンドラー
    const handleDragOver = (event: DragOverEvent) => {
        const { over, active } = event;

        console.log("🎯 handleDragOver called:", {
            activeId: active.id,
            overId: over?.id,
            event,
        });

        if (!over) {
            setDragState(prev => ({ ...prev, dropIndicator: null }));
            return;
        }

        // 自分自身の上にドラッグしている場合はインジケーターを表示しない
        if (active.id === over.id) {
            setDragState(prev => ({ ...prev, dropIndicator: null }));
            return;
        }

        const isDraggingChild = childIdPattern.test(active.id as string);
        const isOverChild = childIdPattern.test(over.id as string);

        // サイドバーかどうかの判定
        const isActiveSidebar = (active.id as string).startsWith("sidebar-");
        const isOverSidebar = (over.id as string).startsWith("sidebar-");

        console.log("🎯 ドロップインジケーター判定:", {
            isDraggingChild,
            isOverChild,
            isActiveSidebar,
            isOverSidebar,
            activeId: active.id,
            overId: over.id,
        });

        if (!isDraggingChild && !isOverChild) {
            // Parent要素のドラッグ中
            if (isActiveSidebar && isOverSidebar) {
                // サイドバー内でのParent要素ドラッグ
                const activeId = (active.id as string).replace("sidebar-", "");
                const overId = (over.id as string).replace("sidebar-", "");

                const activeIndex = parentFields.findIndex(
                    field => field.id === activeId
                );
                const overIndex = parentFields.findIndex(
                    field => field.id === overId
                );

                console.log("🎯 サイドバー Parent ドロップインジケーター:", {
                    activeId,
                    overId,
                    activeIndex,
                    overIndex,
                });

                if (activeIndex !== -1 && overIndex !== -1) {
                    const position =
                        activeIndex < overIndex ? "after" : "before";

                    console.log("🎯 サイドバー ドロップインジケーター表示:", {
                        targetId: over.id,
                        position,
                    });

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: over.id as string,
                            position,
                        },
                    }));
                }
            } else if (!isActiveSidebar && !isOverSidebar) {
                // フォーム内でのParent要素ドラッグ
                const activeIndex = parentFields.findIndex(
                    field => field.id === active.id
                );
                const overIndex = parentFields.findIndex(
                    field => field.id === over.id
                );

                if (activeIndex !== -1 && overIndex !== -1) {
                    const position =
                        activeIndex < overIndex ? "after" : "before";

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: over.id as string,
                            position,
                        },
                    }));
                }
            }
        } else if (isDraggingChild && isOverChild) {
            // Child要素のドラッグ中
            const activeIdStr = active.id as string;
            const overIdStr = over.id as string;

            // サイドバーChild要素かどうかの判定
            const sidebarChildPattern = /^sidebar-\d+-\d+$/;
            const isActiveSidebarChild = sidebarChildPattern.test(activeIdStr);
            const isOverSidebarChild = sidebarChildPattern.test(overIdStr);

            if (isActiveSidebarChild && isOverSidebarChild) {
                // サイドバー内でのChild要素ドラッグ
                const [activeParentIndex] = activeIdStr
                    .replace("sidebar-", "")
                    .split("-")
                    .map(Number);
                const [overParentIndex, overChildIndex] = overIdStr
                    .replace("sidebar-", "")
                    .split("-")
                    .map(Number);

                // 同一Parent内でのみドロップインジケーターを表示
                if (activeParentIndex === overParentIndex) {
                    const [, activeChildIndex] = activeIdStr
                        .replace("sidebar-", "")
                        .split("-")
                        .map(Number);
                    const position =
                        activeChildIndex < overChildIndex ? "after" : "before";

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: over.id as string,
                            position,
                        },
                    }));
                }
            } else if (!isActiveSidebarChild && !isOverSidebarChild) {
                // フォーム内でのChild要素ドラッグ（既存の処理）
                const [activeParentIndex] = activeIdStr.split("-").map(Number);
                const [overParentIndex, overChildIndex] = overIdStr
                    .split("-")
                    .map(Number);

                // 同一Parent内でのみドロップインジケーターを表示
                if (activeParentIndex === overParentIndex) {
                    const [, activeChildIndex] = activeIdStr
                        .split("-")
                        .map(Number);
                    const position =
                        activeChildIndex < overChildIndex ? "after" : "before";

                    setDragState(prev => ({
                        ...prev,
                        dropIndicator: {
                            targetId: over.id as string,
                            position,
                        },
                    }));
                }
            }
        }
    };

    // ドラッグ終了ハンドラー
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            setDragState({
                activeId: null,
                draggedItem: null,
                dropIndicator: null,
                sidebarActiveId: null,
                sidebarDraggedItem: null,
            });
            return;
        }

        const isDraggingChild = childIdPattern.test(active.id as string);

        if (!isDraggingChild) {
            // Parent要素の移動処理
            handleParentMove(active, over);
        } else {
            // Child要素の移動処理（後のフェーズで実装）
            handleChildMove(active, over);
        }

        // 状態をクリーンアップ
        setDragState({
            activeId: null,
            draggedItem: null,
            dropIndicator: null,
            sidebarActiveId: null,
            sidebarDraggedItem: null,
        });
    };

    // Parent要素移動の処理
    const handleParentMove = (active: Active, over: Over) => {
        const activeIndex = parentFields.findIndex(
            field => field.id === active.id
        );
        const overIndex = parentFields.findIndex(field => field.id === over.id);

        if (
            activeIndex !== -1 &&
            overIndex !== -1 &&
            activeIndex !== overIndex
        ) {
            // useFieldArrayのmove関数を使用して要素を移動
            move(activeIndex, overIndex);
        }
    };

    // Child要素移動の処理
    const handleChildMove = (active: Active, over: Over) => {
        const activeChildId = active.id as string;
        const overChildId = over.id as string;

        // IDから親と子のインデックスを抽出
        const [activeParentIndex, activeChildIndex] = activeChildId
            .split("-")
            .map(Number);
        const [overParentIndex, overChildIndex] = overChildId
            .split("-")
            .map(Number);

        // 同一Parent内での並び替えのみ対応（Phase 2）
        if (activeParentIndex === overParentIndex) {
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
        }

        // 異なるParent間の移動は後のフェーズで実装
        console.log(
            "Cross-parent child move will be implemented in next phase"
        );
    };

    // サイドバーChild要素移動の処理
    const handleSidebarChildMove = (active: Active, over: Over) => {
        const activeChildId = active.id as string;
        const overChildId = over.id as string;

        // "sidebar-0-1" -> [0, 1] の形式でIDから親と子のインデックスを抽出
        const [activeParentIndex, activeChildIndex] = activeChildId
            .replace("sidebar-", "")
            .split("-")
            .map(Number);
        const [overParentIndex, overChildIndex] = overChildId
            .replace("sidebar-", "")
            .split("-")
            .map(Number);

        console.log("サイドバー: Child要素移動", {
            activeParentIndex,
            activeChildIndex,
            overParentIndex,
            overChildIndex,
        });

        // 同一Parent内での並び替えのみ対応
        if (activeParentIndex === overParentIndex) {
            const currentParent = getValues(`parentArray.${activeParentIndex}`);
            const newChildArray = [...currentParent.childArray];

            // 配列内での移動
            const [movedChild] = newChildArray.splice(activeChildIndex, 1);
            newChildArray.splice(overChildIndex, 0, movedChild);

            console.log("サイドバー: Child要素移動実行", {
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
            console.log("サイドバー: 異なるParent間の移動は未対応");
        }
    };

    // サイドバー用カスタム衝突検出
    const sidebarCollisionDetection = (args: any) => {
        const { active, collisionRect, droppableContainers } = args;

        if (!active) return [];

        const activeIdStr = active.id as string;
        const sidebarChildPattern = /^sidebar-\d+-\d+$/;
        const isActiveSidebarChild = sidebarChildPattern.test(activeIdStr);

        // アクティブな要素がサイドバーChild要素の場合
        if (isActiveSidebarChild) {
            // Child要素は同じタイプの要素（他のChild要素）のみに衝突
            const validContainers = Array.from(
                droppableContainers.values()
            ).filter((container: any) => {
                const containerIdStr = container.id as string;
                return sidebarChildPattern.test(containerIdStr);
            });

            return validContainers
                .filter((container: any) => {
                    return (
                        collisionRect &&
                        container.rect.current &&
                        collisionRect.left < container.rect.current.right &&
                        collisionRect.right > container.rect.current.left &&
                        collisionRect.top < container.rect.current.bottom &&
                        collisionRect.bottom > container.rect.current.top
                    );
                })
                .sort((a: any, b: any) => {
                    const aRect = a.rect.current;
                    const bRect = b.rect.current;
                    if (!aRect || !bRect) return 0;

                    // 縦方向の距離で並び替え
                    const aCenterY = aRect.top + aRect.height / 2;
                    const bCenterY = bRect.top + bRect.height / 2;
                    const centerY =
                        collisionRect.top + collisionRect.height / 2;

                    return (
                        Math.abs(aCenterY - centerY) -
                        Math.abs(bCenterY - centerY)
                    );
                })
                .map((container: any) => ({ id: container.id }));
        } else {
            // Parent要素は他のParent要素のみに衝突
            const validContainers = Array.from(
                droppableContainers.values()
            ).filter((container: any) => {
                const containerIdStr = container.id as string;
                return (
                    containerIdStr.startsWith("sidebar-") &&
                    !sidebarChildPattern.test(containerIdStr)
                );
            });

            return validContainers
                .filter((container: any) => {
                    return (
                        collisionRect &&
                        container.rect.current &&
                        collisionRect.left < container.rect.current.right &&
                        collisionRect.right > container.rect.current.left &&
                        collisionRect.top < container.rect.current.bottom &&
                        collisionRect.bottom > container.rect.current.top
                    );
                })
                .sort((a: any, b: any) => {
                    const aRect = a.rect.current;
                    const bRect = b.rect.current;
                    if (!aRect || !bRect) return 0;

                    // 縦方向の距離で並び替え
                    const aCenterY = aRect.top + aRect.height / 2;
                    const bCenterY = bRect.top + bRect.height / 2;
                    const centerY =
                        collisionRect.top + collisionRect.height / 2;

                    return (
                        Math.abs(aCenterY - centerY) -
                        Math.abs(bCenterY - centerY)
                    );
                })
                .map((container: any) => ({ id: container.id }));
        }
    };

    const addParent = () => {
        appendParent({
            parentKey: `parent${parentFields.length + 1}`,
            parentValue: `Parent ${parentFields.length + 1}`,
            childArray: [],
        });
    };

    // サイドバー専用のドラッグオーバーハンドラー
    const handleSidebarDragOver = (event: DragOverEvent) => {
        const { over, active } = event;

        console.log("🎯 サイドバー: handleSidebarDragOver called:", {
            activeId: active.id,
            overId: over?.id,
            event,
        });

        if (!over) {
            setDragState(prev => ({ ...prev, dropIndicator: null }));
            return;
        }

        // 自分自身の上にドラッグしている場合はインジケーターを表示しない
        if (active.id === over.id) {
            setDragState(prev => ({ ...prev, dropIndicator: null }));
            return;
        }

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        // サイドバーChild要素かどうかの判定
        const sidebarChildPattern = /^sidebar-\d+-\d+$/;
        const isActiveSidebarChild = sidebarChildPattern.test(activeIdStr);
        const isOverSidebarChild = sidebarChildPattern.test(overIdStr);

        console.log("🎯 サイドバー: ドロップインジケーター判定:", {
            isActiveSidebarChild,
            isOverSidebarChild,
            activeId: active.id,
            overId: over.id,
        });

        if (isActiveSidebarChild && isOverSidebarChild) {
            // サイドバー内でのChild要素ドラッグ
            const [activeParentIndex] = activeIdStr
                .replace("sidebar-", "")
                .split("-")
                .map(Number);
            const [overParentIndex, overChildIndex] = overIdStr
                .replace("sidebar-", "")
                .split("-")
                .map(Number);

            console.log("🎯 サイドバー: Child要素間のドラッグ:", {
                activeParentIndex,
                overParentIndex,
                overChildIndex,
            });

            // 同一Parent内でのみドロップインジケーターを表示
            if (activeParentIndex === overParentIndex) {
                const [, activeChildIndex] = activeIdStr
                    .replace("sidebar-", "")
                    .split("-")
                    .map(Number);
                const position =
                    activeChildIndex < overChildIndex ? "after" : "before";

                console.log(
                    "🎯 サイドバー: Child ドロップインジケーター表示:",
                    {
                        targetId: over.id,
                        position,
                        activeChildIndex,
                        overChildIndex,
                    }
                );

                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: over.id as string,
                        position,
                    },
                }));
            } else {
                console.log("🎯 サイドバー: 異なるParent間のChild移動は無効");
                setDragState(prev => ({ ...prev, dropIndicator: null }));
            }
        } else if (!isActiveSidebarChild && !isOverSidebarChild) {
            // サイドバー内でのParent要素ドラッグ
            const activeOriginalId = activeIdStr.replace("sidebar-", "");
            const overOriginalId = overIdStr.replace("sidebar-", "");

            const activeIndex = parentFields.findIndex(
                field => field.id === activeOriginalId
            );
            const overIndex = parentFields.findIndex(
                field => field.id === overOriginalId
            );

            console.log("🎯 サイドバー: Parent ドロップインジケーター:", {
                activeId: activeOriginalId,
                overId: overOriginalId,
                activeIndex,
                overIndex,
            });

            if (activeIndex !== -1 && overIndex !== -1) {
                const position = activeIndex < overIndex ? "after" : "before";

                console.log(
                    "🎯 サイドバー: Parent ドロップインジケーター表示:",
                    {
                        targetId: over.id,
                        position,
                    }
                );

                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: over.id as string,
                        position,
                    },
                }));
            }
        } else {
            // 異なるタイプ間のドラッグは無効
            console.log("🎯 サイドバー: 異なるタイプ間のドラッグは無効");
            setDragState(prev => ({ ...prev, dropIndicator: null }));
        }
    };

    // サイドバー専用のドラッグハンドラー
    const handleSidebarDragStart = (event: DragStartEvent) => {
        const { active } = event;

        console.log("🎯 サイドバー: ドラッグ開始", {
            activeId: active.id,
            activeType: typeof active.id,
        });

        setDragState(prev => ({
            ...prev,
            sidebarActiveId: active.id as string,
        }));

        const activeIdStr = active.id as string;

        // サイドバーのChild要素かどうかの判定
        const sidebarChildPattern = /^sidebar-\d+-\d+$/;
        const isSidebarChild = sidebarChildPattern.test(activeIdStr);

        if (isSidebarChild) {
            // "sidebar-0-1" -> [0, 1]
            const [parentIndex, childIndex] = activeIdStr
                .replace("sidebar-", "")
                .split("-")
                .map(Number);

            console.log("🎯 サイドバー: Child要素をドラッグ中", {
                parentIndex,
                childIndex,
            });
            setDragState(prev => ({
                ...prev,
                sidebarDraggedItem: {
                    type: "child",
                    parentIndex,
                    childIndex,
                    data: watchedData.parentArray[parentIndex].childArray[
                        childIndex
                    ],
                },
            }));
        } else {
            // Parent要素のドラッグ（既存の処理）
            const parentIndex = parentFields.findIndex(
                field => field.id === activeIdStr.replace(/^sidebar-/, "")
            );
            if (parentIndex !== -1) {
                console.log(
                    "🎯 サイドバー: Parent要素をドラッグ中",
                    parentIndex
                );
                setDragState(prev => ({
                    ...prev,
                    sidebarDraggedItem: {
                        type: "parent",
                        parentIndex,
                        data: watchedData.parentArray[parentIndex],
                    },
                }));
            }
        }
    };

    const handleSidebarDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        console.log("サイドバー: ドラッグ終了", {
            activeId: active.id,
            overId: over?.id,
        });

        // overId が存在しない場合は無効なドロップ
        if (!over) {
            console.log("サイドバー: ドロップターゲットなし");
            setDragState(prev => ({
                ...prev,
                sidebarActiveId: null,
                sidebarDraggedItem: null,
                dropIndicator: null,
            }));
            return;
        }

        const activeIdStr = active.id as string;
        const overIdStr = over.id as string;

        // サイドバーChild要素かどうかの判定
        const sidebarChildPattern = /^sidebar-\d+-\d+$/;
        const isActiveChild = sidebarChildPattern.test(activeIdStr);
        const isOverChild = sidebarChildPattern.test(overIdStr);

        if (isActiveChild && isOverChild) {
            // サイドバーChild要素の移動処理
            console.log("サイドバー: Child要素移動処理");
            handleSidebarChildMove(active, over);
        } else if (!isActiveChild && !isOverChild) {
            // サイドバーParent要素の移動処理（既存の処理）
            console.log("サイドバー: Parent要素移動処理");

            // sidebar-プレフィックスを削除して元のIDを取得
            const activeOriginalId = activeIdStr.replace(/^sidebar-/, "");
            const overOriginalId = overIdStr.replace(/^sidebar-/, "");

            console.log("サイドバー: ID変換", {
                activeId: active.id,
                overId: over.id,
                activeOriginalId,
                overOriginalId,
            });

            // インデックスを取得
            const activeIndex = parentFields.findIndex(
                field => field.id === activeOriginalId
            );
            const overIndex = parentFields.findIndex(
                field => field.id === overOriginalId
            );

            console.log("サイドバー: インデックス", {
                activeIndex,
                overIndex,
            });

            // 有効なインデックスで、かつ位置が異なる場合のみ移動を実行
            if (
                activeIndex !== -1 &&
                overIndex !== -1 &&
                activeIndex !== overIndex
            ) {
                console.log("サイドバー: Parent移動処理を実行");
                move(activeIndex, overIndex);
            } else {
                console.log("サイドバー: 移動不要または無効な移動", {
                    reason:
                        activeIndex === -1
                            ? "activeIndex not found"
                            : overIndex === -1
                              ? "overIndex not found"
                              : "same index",
                });
            }
        }

        // サイドバーの状態をクリーンアップ
        setDragState(prev => ({
            ...prev,
            sidebarActiveId: null,
            sidebarDraggedItem: null,
            dropIndicator: null,
        }));
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

    const onSubmit = (data: Data) => {
        console.log("Submitted data:", data);
        window.alert("Form submitted! Check console for data.");
    };

    return {
        register,
        handleSubmit,
        parentFields,
        watchedData,
        addParent,
        addChild,
        removeChild,
        removeParent,
        onSubmit,
        // ドラッグ関連
        formSensors,
        sidebarSensors,
        sidebarCollisionDetection,
        dragHandlers: {
            onDragStart: handleDragStart,
            onDragOver: handleDragOver,
            onDragEnd: handleDragEnd,
            onSidebarDragStart: handleSidebarDragStart,
            onSidebarDragOver: handleSidebarDragOver,
            onSidebarDragEnd: handleSidebarDragEnd,
        },
        dragState,
    };
}
