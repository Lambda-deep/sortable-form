import { useState, useEffect, useRef } from "react";
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
            // Child要素のドラッグ中（同一Parent内のみ）
            const [activeParentIndex] = (active.id as string)
                .split("-")
                .map(Number);
            const [overParentIndex, overChildIndex] = (over.id as string)
                .split("-")
                .map(Number);

            // 同一Parent内でのみドロップインジケーターを表示
            if (activeParentIndex === overParentIndex) {
                const [, activeChildIndex] = (active.id as string)
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

            // サイドバーデータを強制的に更新
            const currentFormData = getValues();
            setSidebarData({
                parentArray: [...currentFormData.parentArray],
            });
        }

        // 異なるParent間の移動は後のフェーズで実装
        console.log(
            "Cross-parent child move will be implemented in next phase"
        );
    };

    // サイドバー用のデータ状態
    const [sidebarData, setSidebarData] = useState<Data>(() => ({
        parentArray: [...initialData.parentArray],
    }));

    // フォームデータとサイドバーデータの同期（usePrevious pattern）
    const prevWatchedDataRef = useRef<string>("");

    useEffect(() => {
        const currentFormDataString = JSON.stringify(watchedData.parentArray);

        if (prevWatchedDataRef.current !== currentFormDataString) {
            setSidebarData({
                parentArray: JSON.parse(
                    JSON.stringify(watchedData.parentArray)
                ),
            });
            prevWatchedDataRef.current = currentFormDataString;
        }
    }, [watchedData.parentArray]);

    const addParent = () => {
        appendParent({
            parentKey: `parent${parentFields.length + 1}`,
            parentValue: `Parent ${parentFields.length + 1}`,
            childArray: [],
        });
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

        const parentIndex = parentFields.findIndex(
            field => field.id === (active.id as string).replace(/^sidebar-/, "")
        );
        if (parentIndex !== -1) {
            console.log("🎯 サイドバー: Parent要素をドラッグ中", parentIndex);
            setDragState(prev => ({
                ...prev,
                sidebarDraggedItem: {
                    type: "parent",
                    parentIndex,
                    data: watchedData.parentArray[parentIndex],
                },
            }));
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

        // sidebar-プレフィックスを削除して元のIDを取得
        const activeOriginalId = (active.id as string).replace(/^sidebar-/, "");
        const overOriginalId = (over.id as string).replace(/^sidebar-/, "");

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
        setValue(`parentArray.${parentIndex}.childArray`, [
            ...currentParent.childArray,
            newChild,
        ]);
    };

    const removeChild = (parentIndex: number, childIndex: number) => {
        const currentParent = getValues(`parentArray.${parentIndex}`);
        const newChildArray = currentParent.childArray.filter(
            (_, index) => index !== childIndex
        );
        setValue(`parentArray.${parentIndex}.childArray`, newChildArray);
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
        sidebarData,
        addParent,
        addChild,
        removeChild,
        removeParent,
        onSubmit,
        // ドラッグ関連
        formSensors,
        sidebarSensors,
        dragHandlers: {
            onDragStart: handleDragStart,
            onDragOver: handleDragOver,
            onDragEnd: handleDragEnd,
            onSidebarDragStart: handleSidebarDragStart,
            onSidebarDragEnd: handleSidebarDragEnd,
        },
        dragState,
    };
}
