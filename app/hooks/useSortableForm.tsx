import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
    useSensors,
    useSensor,
    KeyboardSensor,
    PointerSensor,
    DragEndEvent,
    DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { closestCenter } from "@dnd-kit/core";
import type { Data, Parent, Child } from "../types";

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
        move: moveParent,
    } = useFieldArray({
        control,
        name: "parentArray",
    });

    const watchedData = watch();
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // カスタム衝突検出：親要素同士の検出を優先
    const customCollisionDetection = (args: any) => {
        // 子要素のIDパターン: 数字-数字
        const childIdPattern = /^\d+-\d+$/;
        const isDraggingParent =
            typeof args.active.id === "string" &&
            !childIdPattern.test(args.active.id);

        // 親要素のドラッグ時は親要素のみをターゲットにする
        if (isDraggingParent) {
            const parentRects = new Map();
            for (const [id, rect] of args.droppableRects) {
                if (typeof id === "string" && !childIdPattern.test(id)) {
                    parentRects.set(id, rect);
                }
            }

            if (parentRects.size > 0) {
                return closestCenter({
                    ...args,
                    droppableRects: parentRects,
                });
            }
        }

        // デフォルトの衝突検出
        return closestCenter(args);
    };

    function handleDragStart(event: DragStartEvent) {
        setActiveId(String(event.active.id));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        console.log("Drag end:", { activeId: active.id, overId: over?.id });
        console.log(
            "Active ID type:",
            typeof active.id,
            "includes dash:",
            String(active.id).includes("-")
        );
        console.log(
            "Over ID type:",
            typeof over?.id,
            "includes dash:",
            String(over?.id).includes("-")
        );

        if (active.id !== over?.id) {
            console.log("IDs are different, proceeding with reorder logic");
            // Handle parent reordering
            if (typeof active.id === "string" && typeof over?.id === "string") {
                console.log("Both IDs are strings");

                // 子要素のIDパターン: 数字-数字 (例: "0-0", "1-2")
                const childIdPattern = /^\d+-\d+$/;
                const isActiveChild = childIdPattern.test(active.id);
                const isOverChild = childIdPattern.test(over.id);

                console.log(
                    "Active is child:",
                    isActiveChild,
                    "Over is child:",
                    isOverChild
                );

                if (!isActiveChild && !isOverChild) {
                    // Parent item drag
                    console.log("Parent drag detected");
                    console.log(
                        "ParentFields IDs:",
                        parentFields.map((f) => f.id)
                    );
                    const oldIndex = parentFields.findIndex(
                        (field) => field.id === active.id
                    );
                    const newIndex = parentFields.findIndex(
                        (field) => field.id === over.id
                    );
                    console.log("Parent indices:", { oldIndex, newIndex });

                    if (oldIndex !== -1 && newIndex !== -1) {
                        console.log(
                            "Moving parent from",
                            oldIndex,
                            "to",
                            newIndex
                        );
                        moveParent(oldIndex, newIndex);
                    } else {
                        console.log("Failed to find parent indices");
                    }
                } else if (isActiveChild && isOverChild) {
                    // Child item drag - same parent reordering
                    const activeParentIndex = parseInt(active.id.split("-")[0]);
                    const activeChildIndex = parseInt(active.id.split("-")[1]);
                    const overParentIndex = parseInt(over.id.split("-")[0]);
                    const overChildIndex = parseInt(over.id.split("-")[1]);

                    if (activeParentIndex === overParentIndex) {
                        // Same parent reordering
                        console.log("Same parent reordering");
                        const currentData = getValues("parentArray");
                        const newParentArray = [...currentData];
                        const childArray = [
                            ...newParentArray[activeParentIndex].childArray,
                        ];

                        const newChildArray = arrayMove(
                            childArray,
                            activeChildIndex,
                            overChildIndex
                        );

                        newParentArray[activeParentIndex] = {
                            ...newParentArray[activeParentIndex],
                            childArray: newChildArray,
                        };

                        setValue("parentArray", newParentArray);
                    } else {
                        // Different parent reordering - move child between parents
                        console.log(
                            "Different parent reordering - moving child between parents"
                        );
                        console.log(
                            `Moving child from parent ${activeParentIndex} index ${activeChildIndex} to parent ${overParentIndex} index ${overChildIndex}`
                        );

                        const currentData = getValues("parentArray");
                        const newParentArray = [...currentData];

                        // Get the child to move
                        const childToMove = {
                            ...newParentArray[activeParentIndex].childArray[
                                activeChildIndex
                            ],
                        };
                        console.log("Child to move:", childToMove);

                        // Remove child from source parent
                        const sourceChildArray = [
                            ...newParentArray[activeParentIndex].childArray,
                        ];
                        sourceChildArray.splice(activeChildIndex, 1);
                        newParentArray[activeParentIndex] = {
                            ...newParentArray[activeParentIndex],
                            childArray: sourceChildArray,
                        };

                        // Add child to target parent
                        const targetChildArray = [
                            ...newParentArray[overParentIndex].childArray,
                        ];
                        targetChildArray.splice(overChildIndex, 0, childToMove);
                        newParentArray[overParentIndex] = {
                            ...newParentArray[overParentIndex],
                            childArray: targetChildArray,
                        };

                        console.log("Updated parent array:", newParentArray);
                        setValue("parentArray", newParentArray);
                    }
                }
            }
        }

        // ドラッグ終了時にactiveIdをリセット
        setActiveId(null);
    }

    const addParent = () => {
        appendParent({
            parentKey: `parent${Date.now()}`,
            parentValue: `New Parent ${parentFields.length + 1}`,
            childArray: [],
        });
    };

    const addChild = (parentIndex: number) => {
        const currentData = watchedData.parentArray;
        const newParentArray = [...currentData];
        const newChild: Child = {
            childKey: `child${Date.now()}`,
            childValue: `New Child ${
                newParentArray[parentIndex].childArray.length + 1
            }`,
        };
        newParentArray[parentIndex] = {
            ...newParentArray[parentIndex],
            childArray: [...newParentArray[parentIndex].childArray, newChild],
        };
        setValue("parentArray", newParentArray);
    };

    const removeChild = (parentIndex: number, childIndex: number) => {
        const currentData = watchedData.parentArray;
        const newParentArray = [...currentData];
        const newChildArray = [...newParentArray[parentIndex].childArray];
        newChildArray.splice(childIndex, 1);
        newParentArray[parentIndex] = {
            ...newParentArray[parentIndex],
            childArray: newChildArray,
        };
        setValue("parentArray", newParentArray);
    };

    const onSubmit = (data: Data) => {
        console.log("Form data:", JSON.stringify(data, null, 2));
    };

    return {
        // Form controls
        control,
        register,
        watch,
        setValue,
        getValues,
        handleSubmit,

        // Parent array controls
        parentFields,
        appendParent,
        removeParent,
        moveParent,

        // State
        watchedData,
        activeId,

        // Drag & Drop
        sensors,
        customCollisionDetection,
        handleDragStart,
        handleDragEnd,

        // Helper functions
        addParent,
        addChild,
        removeChild,
        onSubmit,
    };
}
