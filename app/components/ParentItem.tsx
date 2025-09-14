import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Data, Child, ParentItemProps } from "../types";
import { SortableChildItem } from "./SortableChildItem";

export function ParentItem({
    parentField,
    parentIndex,
    register,
    removeParent,
    watchedData,
    addChild,
    removeChild,
    dragSource,
    getChildId = (parentIndex, childIndex) => `${parentIndex}-${childIndex}`,
}: ParentItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: parentField.id });

    const elementRef = useRef<HTMLDivElement>(null);
    const [originalSize, setOriginalSize] = useState<{
        width: number;
        height: number;
    } | null>(null);

    // 元のサイズを記録（クライアントサイドでのみ）
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            elementRef.current &&
            !originalSize
        ) {
            const rect = elementRef.current.getBoundingClientRect();
            setOriginalSize({
                width: rect.width,
                height: rect.height,
            });
        }
    }, [originalSize]);

    const style = {
        transform: CSS.Transform.toString(transform),
        // transition,
        // ドラッグ中は元のサイズを維持
        ...(isDragging &&
            originalSize && {
                width: `${originalSize.width}px`,
                height: `${originalSize.height}px`,
                minHeight: `${originalSize.height}px`,
                maxHeight: `${originalSize.height}px`,
                zIndex: 1000,
            }),
    };

    // refを結合する
    const combinedRef = useCallback(
        (node: HTMLDivElement | null) => {
            setNodeRef(node);
            (
                elementRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = node;
        },
        [setNodeRef]
    );

    return (
        <div
            ref={combinedRef}
            style={style}
            data-testid="parent-item"
            data-sortable-id={parentField.id}
            data-drag-source="form"
            className="border border-gray-300 p-4 mb-4 rounded bg-gray-50"
        >
            <div
                className="flex gap-2 items-center mb-2"
                {...attributes}
                {...listeners}
            >
                <span
                    data-testid="parent-drag-handle"
                    className="cursor-move text-gray-600 text-lg"
                >
                    ⋮⋮
                </span>
                <input
                    {...register(`parentArray.${parentIndex}.parentKey`)}
                    className="flex-1 px-2 py-1 border border-gray-400 rounded"
                    placeholder="Parent Key"
                />
                <input
                    {...register(`parentArray.${parentIndex}.parentValue`)}
                    className="flex-1 px-2 py-1 border border-gray-400 rounded"
                    placeholder="Parent Value"
                />
                <button
                    type="button"
                    className="bg-red-600 text-white border-none px-2 py-1 rounded-sm cursor-pointer text-xs hover:bg-red-700"
                    onClick={() => removeParent(parentIndex)}
                >
                    Remove
                </button>
            </div>

            <div
                data-testid="children-container"
                className="mt-4 p-2 bg-white rounded border border-gray-300"
            >
                <h4>Children:</h4>
                {dragSource !== "sidebar" && (
                    <SortableContext
                        items={
                            watchedData.parentArray[
                                parentIndex
                            ]?.childArray?.map((child, childIndex) =>
                                getChildId(parentIndex, childIndex)
                            ) || []
                        }
                        strategy={verticalListSortingStrategy}
                    >
                        {watchedData.parentArray[parentIndex]?.childArray.map(
                            (child: Child, childIndex: number) => (
                                <SortableChildItem
                                    key={getChildId(parentIndex, childIndex)}
                                    id={getChildId(parentIndex, childIndex)}
                                    child={child}
                                    parentIndex={parentIndex}
                                    childIndex={childIndex}
                                    register={register}
                                    removeChild={removeChild}
                                    dragSource={dragSource}
                                />
                            )
                        )}
                    </SortableContext>
                )}
                {dragSource === "sidebar" && (
                    <div>
                        {watchedData.parentArray[parentIndex]?.childArray.map(
                            (child: Child, childIndex: number) => (
                                <SortableChildItem
                                    key={getChildId(parentIndex, childIndex)}
                                    id={getChildId(parentIndex, childIndex)}
                                    child={child}
                                    parentIndex={parentIndex}
                                    childIndex={childIndex}
                                    register={register}
                                    removeChild={removeChild}
                                    dragSource={dragSource}
                                />
                            )
                        )}
                    </div>
                )}
                <button
                    type="button"
                    className="bg-blue-600 text-white border-none px-3 py-2 rounded cursor-pointer hover:bg-blue-700"
                    onClick={() => addChild(parentIndex)}
                >
                    Add Child
                </button>
            </div>
        </div>
    );
}
