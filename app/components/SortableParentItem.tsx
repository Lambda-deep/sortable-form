import { useEffect, useRef } from "react";
import Sortable from "sortablejs";
import type { ParentItemProps } from "../types";
import { SortableChildItem } from "./SortableChildItem";
import Button from "./Button";
import DragHandle from "./DragHandle";

interface SortableParentItemProps extends ParentItemProps {
    updateParentOrder: (oldIndex: number, newIndex: number) => void;
    updateChildOrder: (parentIndex: number, oldIndex: number, newIndex: number) => void;
    moveChildBetweenParents: (fromParentIndex: number, toParentIndex: number, fromChildIndex: number, toChildIndex: number) => void;
    commonSortableConfig: any;
    childSortableRefs: React.MutableRefObject<{ [key: number]: Sortable }>;
}

export function SortableParentItem({
    parentIndex,
    register,
    removeParent,
    watchedData,
    addChild,
    removeChild,
    updateParentOrder: _updateParentOrder, // Unused at component level, handled at container level
    updateChildOrder,
    moveChildBetweenParents,
    commonSortableConfig,
    childSortableRefs,
}: SortableParentItemProps) {
    const currentParent = watchedData.parentArray[parentIndex];
    const childrenContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only run on client side to avoid hydration issues
        if (typeof window === 'undefined') return;
        if (!childrenContainerRef.current) return;

        // 既存のSortableインスタンスをクリーンアップ
        if (childSortableRefs.current[parentIndex]) {
            childSortableRefs.current[parentIndex].destroy();
        }

        // 子要素用のSortable設定
        const childSortableConfig = {
            ...commonSortableConfig,
            group: "children", // 同じグループ名で親間移動を可能に
            onEnd: (evt: any) => {
                const fromParentIndex = parseInt(evt.from.dataset.parentIndex || "0", 10);
                const toParentIndex = parseInt(evt.to.dataset.parentIndex || "0", 10);
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;

                if (fromParentIndex === toParentIndex && oldIndex !== newIndex) {
                    // 同じ親内での移動（かつ実際に位置が変わった場合のみ）
                    updateChildOrder(fromParentIndex, oldIndex, newIndex);
                } else if (fromParentIndex !== toParentIndex) {
                    // 異なる親間での移動
                    moveChildBetweenParents(fromParentIndex, toParentIndex, oldIndex, newIndex);
                }
            },
        };

        try {
            // Sortableインスタンスを作成
            const sortableInstance = Sortable.create(childrenContainerRef.current, childSortableConfig);
            childSortableRefs.current[parentIndex] = sortableInstance;
        } catch (error) {
            console.error('Error creating Sortable instance:', error);
        }

        return () => {
            if (childSortableRefs.current[parentIndex]) {
                childSortableRefs.current[parentIndex].destroy();
                delete childSortableRefs.current[parentIndex];
            }
        };
    }, [parentIndex, commonSortableConfig]);

    return (
        <div
            data-testid="parent-item"
            className="rounded border border-gray-300 bg-gray-50 p-4"
        >
            <div className="flex items-center gap-2">
                <DragHandle data-testid="parent-drag-handle" />
                <input
                    {...register(`parentArray.${parentIndex}.parentKey`)}
                    className="flex-1 rounded border border-gray-400 px-2 py-1"
                    placeholder="Parent Key"
                />
                <input
                    {...register(`parentArray.${parentIndex}.parentValue`)}
                    className="flex-1 rounded border border-gray-400 px-2 py-1"
                    placeholder="Parent Value"
                />
                <Button
                    type="button"
                    variant="remove"
                    size="sm"
                    onClick={() => removeParent(parentIndex)}
                >
                    Remove
                </Button>
            </div>

            <div
                ref={childrenContainerRef}
                data-testid="children-container"
                data-parent-index={parentIndex}
                className="mt-2 flex flex-col gap-2 rounded border border-gray-300 bg-white p-2"
            >
                {currentParent?.childArray?.map((_, childIndex: number) => (
                    <SortableChildItem
                        key={`${parentIndex}-${childIndex}`}
                        parentIndex={parentIndex}
                        childIndex={childIndex}
                        register={register}
                        removeChild={removeChild}
                    />
                ))}
            </div>
            <Button
                type="button"
                variant="add"
                size="sm"
                className="mt-2"
                onClick={() => addChild(parentIndex)}
            >
                Add Child
            </Button>
        </div>
    );
}