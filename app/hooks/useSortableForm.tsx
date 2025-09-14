import { useState, useEffect } from "react";
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

    // Child要素移動の処理（Phase 3で実装）
    const handleChildMove = (active: Active, over: Over) => {
        // 次のフェーズで実装
        console.log("Child move will be implemented in Phase 3", {
            active,
            over,
        });
    };

    // サイドバー用のデータ状態
    const [sidebarData, setSidebarData] = useState<Data>(() => ({
        parentArray: [...initialData.parentArray],
    }));

    // フォームデータとサイドバーデータの同期（JSON比較で無限ループを防ぐ）
    useEffect(() => {
        const newSidebarData = {
            parentArray: [...watchedData.parentArray],
        };

        // JSON文字列の比較で変更を検出
        if (JSON.stringify(sidebarData) !== JSON.stringify(newSidebarData)) {
            setSidebarData(newSidebarData);
        }
    }, [watchedData.parentArray, sidebarData]);

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
