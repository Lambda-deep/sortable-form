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
    });

    // センサーの設定
    const sensors = useSensors(
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

        if (!isDraggingChild && !isOverChild) {
            // Parent要素のドラッグ中
            const activeIndex = parentFields.findIndex(
                field => field.id === active.id
            );
            const overIndex = parentFields.findIndex(
                field => field.id === over.id
            );

            if (activeIndex !== -1 && overIndex !== -1) {
                const position = activeIndex < overIndex ? "after" : "before";

                setDragState(prev => ({
                    ...prev,
                    dropIndicator: {
                        targetId: over.id as string,
                        position,
                    },
                }));
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
                parentArray: JSON.parse(JSON.stringify(watchedData.parentArray)),
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
        sensors,
        dragHandlers: {
            onDragStart: handleDragStart,
            onDragOver: handleDragOver,
            onDragEnd: handleDragEnd,
        },
        dragState,
    };
}
