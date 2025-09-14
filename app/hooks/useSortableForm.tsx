import { useState, useEffect } from "react";
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
import type { Data, Child } from "../types";

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
    const {
        control,
        register,
        watch,
        setValue,
        getValues,
        handleSubmit,
        trigger,
    } = useForm<Data>({
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
    const [dragSource, setDragSource] = useState<"form" | "sidebar" | null>(
        null
    );
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [dragOverPosition, setDragOverPosition] = useState<
        "before" | "after" | null
    >(null);

    // サイドバー専用の独立した状態
    const [sidebarData, setSidebarData] = useState<Data>(() => ({
        parentArray: [...initialData.parentArray],
    }));

    // フォームデータとサイドバーデータの双方向同期
    const [lastFormData, setLastFormData] = useState<Data>(initialData);
    const [lastSidebarData, setLastSidebarData] = useState<Data>(initialData);
    const [isSyncing, setIsSyncing] = useState(false);

    // フォーム→サイドバーの同期（フォームが変更されたとき）
    useEffect(() => {
        if (
            !isSyncing &&
            JSON.stringify(watchedData) !== JSON.stringify(lastFormData)
        ) {
            setIsSyncing(true);
            const newData = {
                parentArray: [...watchedData.parentArray],
            };
            setSidebarData(newData);
            setLastFormData(watchedData);
            setLastSidebarData(newData);
            // 次のティックでフラグをリセット
            setTimeout(() => setIsSyncing(false), 0);
        }
    }, [watchedData, lastFormData, isSyncing]);

    // サイドバー→フォームの同期（サイドバーが変更されたとき）
    useEffect(() => {
        if (
            !isSyncing &&
            JSON.stringify(sidebarData) !== JSON.stringify(lastSidebarData)
        ) {
            setIsSyncing(true);
            const newFormData = [...sidebarData.parentArray];
            setValue("parentArray", newFormData, {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false,
            });
            setLastSidebarData(sidebarData);
            setLastFormData(sidebarData);
            // 次のティックでフラグをリセット
            setTimeout(() => setIsSyncing(false), 0);
        }
    }, [sidebarData, lastSidebarData, isSyncing, setValue]);

    // インデックスベースの安定したIDを生成
    const getParentId = (index: number) => `parent-${index}`;
    const getChildId = (parentIndex: number, childIndex: number) =>
        `${parentIndex}-${childIndex}`;
    const getSidebarParentId = (index: number) => `sidebar-parent-${index}`;
    const getSidebarChildId = (parentIndex: number, childIndex: number) =>
        `sidebar-${parentIndex}-${childIndex}`;

    // IDがサイドバー由来かを判定
    const isSidebarId = (id: string) => id.startsWith("sidebar-");

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // activationConstraintを削除して自由なドラッグを可能に
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // カスタム衝突検出：正確なドロップ位置を計算
    const customCollisionDetection = (args: any) => {
        const { active, droppableRects, pointerCoordinates } = args;

        // 子要素のIDパターン: 数字-数字 (例: "0-0", "1-2") またはサイドバー子要素 (例: "sidebar-0-0")
        const childIdPattern = /^\d+-\d+$/;
        const sidebarChildIdPattern = /^sidebar-\d+-\d+$/;
        const isDraggingChild =
            (typeof active.id === "string" && childIdPattern.test(active.id)) ||
            (typeof active.id === "string" &&
                sidebarChildIdPattern.test(active.id));

        // 親要素のドラッグ時は親要素のみをターゲットにする
        if (!isDraggingChild) {
            const parentRects = new Map();
            for (const [id, rect] of droppableRects) {
                if (
                    typeof id === "string" &&
                    !childIdPattern.test(id) &&
                    !sidebarChildIdPattern.test(id)
                ) {
                    parentRects.set(id, rect);
                }
            }

            if (parentRects.size > 0) {
                const collisions = closestCenter({
                    ...args,
                    droppableRects: parentRects,
                });

                // ドロップ位置（before/after）を計算
                if (collisions && collisions.length > 0 && pointerCoordinates) {
                    const collision = collisions[0];
                    const targetRect = parentRects.get(collision.id);
                    if (targetRect) {
                        const centerY = targetRect.top + targetRect.height / 2;
                        const position =
                            pointerCoordinates.y < centerY ? "before" : "after";
                        setDragOverId(String(collision.id));
                        setDragOverPosition(position);
                    }
                }

                return collisions;
            }
        } else {
            // 子要素のドラッグ時は子要素のみをターゲットにする
            const childRects = new Map();
            for (const [id, rect] of droppableRects) {
                if (
                    typeof id === "string" &&
                    (childIdPattern.test(id) || sidebarChildIdPattern.test(id))
                ) {
                    childRects.set(id, rect);
                }
            }

            if (childRects.size > 0) {
                const collisions = closestCenter({
                    ...args,
                    droppableRects: childRects,
                });

                // 子要素の場合はdragOverIdとdragOverPositionをクリア（子要素は個別のisOverでインジケーターを表示）
                setDragOverId(null);
                setDragOverPosition(null);

                return collisions;
            }
        }

        // fallback: デフォルトの衝突検出（ドロップ位置情報はクリア）
        setDragOverId(null);
        setDragOverPosition(null);
        return closestCenter(args);
    };

    function handleDragStart(event: DragStartEvent) {
        setActiveId(String(event.active.id));

        // ドラッグソースを識別（data属性から判定）
        const element = document.querySelector(
            `[data-sortable-id="${event.active.id}"]`
        );
        let detectedSource: "form" | "sidebar" | null = null;

        if (element) {
            const dragSourceAttr = element.getAttribute("data-drag-source");
            if (dragSourceAttr === "form") {
                detectedSource = "form";
            } else if (dragSourceAttr === "sidebar") {
                detectedSource = "sidebar";
            } else {
                // fallback: DOMからの識別
                const formElement = element.closest(
                    '[data-testid="form-section"]'
                );
                const sidebarElement = element.closest(
                    '[data-testid="sidebar"]'
                );

                if (formElement) {
                    detectedSource = "form";
                } else if (sidebarElement) {
                    detectedSource = "sidebar";
                }
            }
        }

        setDragSource(detectedSource);
        console.log(
            "Drag started from:",
            detectedSource,
            "Element ID:",
            event.active.id
        );
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        // ドラッグ終了時にドロップ位置をリセット
        setActiveId(null);
        setDragOverId(null);
        setDragOverPosition(null);

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

                // 子要素のIDパターン: 数字-数字 (例: "0-0", "1-2") またはサイドバー子要素 (例: "sidebar-0-0")
                const childIdPattern = /^\d+-\d+$/;
                const sidebarChildIdPattern = /^sidebar-\d+-\d+$/;
                const isActiveChild =
                    childIdPattern.test(active.id) ||
                    sidebarChildIdPattern.test(active.id);
                const isOverChild =
                    childIdPattern.test(over.id) ||
                    sidebarChildIdPattern.test(over.id);

                console.log(
                    "Active is child:",
                    isActiveChild,
                    "Over is child:",
                    isOverChild
                );

                if (!isActiveChild && !isOverChild) {
                    // Parent item drag - インデックスベースIDから実際のインデックスを取得
                    console.log("Parent drag detected");

                    let oldIndex: number, newIndex: number;

                    // サイドバーIDかフォームIDかで処理を分ける
                    if (isSidebarId(active.id)) {
                        oldIndex = parseInt(
                            active.id.replace("sidebar-parent-", "")
                        );
                    } else {
                        oldIndex = parseInt(active.id.replace("parent-", ""));
                    }

                    if (isSidebarId(over.id)) {
                        newIndex = parseInt(
                            over.id.replace("sidebar-parent-", "")
                        );
                    } else {
                        newIndex = parseInt(over.id.replace("parent-", ""));
                    }

                    console.log("Parent indices:", { oldIndex, newIndex });

                    if (
                        oldIndex !== -1 &&
                        newIndex !== -1 &&
                        oldIndex < parentFields.length &&
                        newIndex < parentFields.length
                    ) {
                        console.log(
                            "Moving parent from",
                            oldIndex,
                            "to",
                            newIndex
                        );
                        moveParent(oldIndex, newIndex);
                    } else {
                        console.log("Invalid parent indices");
                    }
                } else if (isActiveChild && isOverChild) {
                    // Child item drag - サイドバーの子要素IDに対応
                    console.log(
                        "Processing child drag. Active ID:",
                        active.id,
                        "Over ID:",
                        over.id
                    );

                    let activeParentIndex: number, activeChildIndex: number;
                    let overParentIndex: number, overChildIndex: number;

                    // サイドバーIDかフォームIDかで処理を分ける
                    if (isSidebarId(active.id)) {
                        const parts = active.id
                            .replace("sidebar-", "")
                            .split("-");
                        activeParentIndex = parseInt(parts[0]);
                        activeChildIndex = parseInt(parts[1]);
                        console.log("Active is sidebar child. Parts:", parts);
                    } else {
                        activeParentIndex = parseInt(active.id.split("-")[0]);
                        activeChildIndex = parseInt(active.id.split("-")[1]);
                        console.log(
                            "Active is form child. Split:",
                            active.id.split("-")
                        );
                    }

                    if (isSidebarId(over.id)) {
                        const parts = over.id
                            .replace("sidebar-", "")
                            .split("-");
                        overParentIndex = parseInt(parts[0]);
                        overChildIndex = parseInt(parts[1]);
                        console.log("Over is sidebar child. Parts:", parts);
                    } else {
                        overParentIndex = parseInt(over.id.split("-")[0]);
                        overChildIndex = parseInt(over.id.split("-")[1]);
                        console.log(
                            "Over is form child. Split:",
                            over.id.split("-")
                        );
                    }

                    if (activeParentIndex === overParentIndex) {
                        // Same parent reordering
                        console.log("Same parent reordering");
                        console.log(
                            "Active parent index:",
                            activeParentIndex,
                            "Active child index:",
                            activeChildIndex
                        );
                        console.log(
                            "Over parent index:",
                            overParentIndex,
                            "Over child index:",
                            overChildIndex
                        );

                        const currentData = getValues("parentArray");
                        const newParentArray = [...currentData];
                        const childArray = [
                            ...newParentArray[activeParentIndex].childArray,
                        ];

                        console.log("Original child array:", childArray);
                        console.log(
                            "Moving from index",
                            activeChildIndex,
                            "to index",
                            overChildIndex
                        );

                        const newChildArray = arrayMove(
                            childArray,
                            activeChildIndex,
                            overChildIndex
                        );

                        console.log("New child array:", newChildArray);

                        newParentArray[activeParentIndex] = {
                            ...newParentArray[activeParentIndex],
                            childArray: newChildArray,
                        };

                        console.log(
                            "Setting new parent array:",
                            newParentArray
                        );
                        setValue("parentArray", newParentArray, {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                        });

                        // 強制的にwatchの更新をトリガー
                        trigger("parentArray");
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

        // ドラッグ終了時にactiveIdとdragSourceをリセット
        setActiveId(null);
        setDragSource(null);
    }

    // サイドバー専用のドラッグハンドラー
    function handleSidebarDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        // ドラッグ終了時にドロップ位置をリセット
        setActiveId(null);
        setDragOverId(null);
        setDragOverPosition(null);

        console.log("Sidebar drag end:", {
            activeId: active.id,
            overId: over?.id,
        });

        if (active.id !== over?.id) {
            if (typeof active.id === "string" && typeof over?.id === "string") {
                const childIdPattern = /^\d+-\d+$/;
                const sidebarChildIdPattern = /^sidebar-\d+-\d+$/;
                const isActiveChild =
                    childIdPattern.test(active.id) ||
                    sidebarChildIdPattern.test(active.id);
                const isOverChild =
                    childIdPattern.test(over.id) ||
                    sidebarChildIdPattern.test(over.id);

                if (!isActiveChild && !isOverChild) {
                    // Parent item drag in sidebar
                    const oldIndex = parseInt(
                        active.id.replace("sidebar-parent-", "")
                    );
                    const newIndex = parseInt(
                        over.id.replace("sidebar-parent-", "")
                    );

                    if (
                        oldIndex !== -1 &&
                        newIndex !== -1 &&
                        oldIndex < sidebarData.parentArray.length &&
                        newIndex < sidebarData.parentArray.length
                    ) {
                        const newParentArray = arrayMove(
                            sidebarData.parentArray,
                            oldIndex,
                            newIndex
                        );
                        setSidebarData({ parentArray: newParentArray });
                    }
                } else if (isActiveChild && isOverChild) {
                    // Child item drag in sidebar
                    const activeParentIndex = parseInt(
                        active.id.replace("sidebar-", "").split("-")[0]
                    );
                    const activeChildIndex = parseInt(
                        active.id.replace("sidebar-", "").split("-")[1]
                    );
                    const overParentIndex = parseInt(
                        over.id.replace("sidebar-", "").split("-")[0]
                    );
                    const overChildIndex = parseInt(
                        over.id.replace("sidebar-", "").split("-")[1]
                    );

                    const newParentArray = [...sidebarData.parentArray];

                    if (activeParentIndex === overParentIndex) {
                        // Same parent reordering in sidebar
                        const newChildArray = arrayMove(
                            newParentArray[activeParentIndex].childArray,
                            activeChildIndex,
                            overChildIndex
                        );
                        newParentArray[activeParentIndex] = {
                            ...newParentArray[activeParentIndex],
                            childArray: newChildArray,
                        };
                    } else {
                        // Different parent reordering in sidebar
                        const childToMove = {
                            ...newParentArray[activeParentIndex].childArray[
                                activeChildIndex
                            ],
                        };

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
                    }

                    setSidebarData({ parentArray: newParentArray });
                }
            }
        }

        setActiveId(null);
        setDragSource(null);
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
        sidebarData,
        activeId,
        dragSource,
        dragOverId,
        dragOverPosition,

        // Drag & Drop
        sensors,
        customCollisionDetection,
        handleDragStart,
        handleDragEnd,
        handleSidebarDragEnd,

        // Helper functions
        addParent,
        addChild,
        removeChild,
        onSubmit,
        getParentId,
        getChildId,
        getSidebarParentId,
        getSidebarChildId,
    };
}
