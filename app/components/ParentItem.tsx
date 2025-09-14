import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Child, ParentItemProps } from "../types";
import { ChildItem } from "./ChildItem";

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
    dragOverId,
    dragOverPosition,
}: ParentItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useSortable({
            id: parentField.id,
            animateLayoutChanges: () => false, // アニメーションを無効にしてスナップを防ぐ
            disabled: false, // ドラッグを有効化
            transition: null, // トランジションを完全に無効化
        });
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

    // ドラッグ開始時にサイズを再測定
    useEffect(() => {
        if (isDragging && elementRef.current && !originalSize) {
            const rect = elementRef.current.getBoundingClientRect();
            setOriginalSize({
                width: rect.width,
                height: rect.height,
            });
        }
    }, [isDragging, originalSize]);

    // ドロップインジケーターの条件を正確に判定
    const shouldShowDropIndicator =
        dragOverId === parentField.id && !isDragging;
    const showBeforeIndicator =
        shouldShowDropIndicator && dragOverPosition === "before";
    const showAfterIndicator =
        shouldShowDropIndicator && dragOverPosition === "after";

    const style = {
        // ドラッグ中はカーソルに追従させる
        transform: CSS.Transform.toString(transform),
        transition: "none", // 常にトランジションを無効
        // ドラッグ中は要素を見えるようにし、zIndexで前面に表示
        ...(isDragging && {
            zIndex: 1000,
            opacity: 0.9,
            boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
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
        <>
            {/* Before ドロップインジケーター */}
            {showBeforeIndicator && (
                <div
                    style={{
                        height: "3px",
                        backgroundColor: "#007bff",
                        marginBottom: "8px",
                        borderRadius: "1px",
                    }}
                />
            )}

            <div
                ref={combinedRef}
                style={style}
                data-testid="parent-item"
                data-sortable-id={parentField.id}
                data-drag-source="form"
                className="mb-4 rounded border border-gray-300 bg-gray-50 p-4"
            >
                <div
                    className="mb-2 flex items-center gap-2"
                    {...attributes}
                    {...listeners}
                >
                    <span
                        data-testid="parent-drag-handle"
                        className="flex h-4 w-4 cursor-grab items-center justify-center text-lg text-gray-600"
                    >
                        ⋮⋮
                    </span>
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
                    <button
                        type="button"
                        className="cursor-pointer rounded-sm border-none bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                        onClick={() => removeParent(parentIndex)}
                    >
                        Remove
                    </button>
                </div>

                <div
                    data-testid="children-container"
                    className="mt-4 rounded border border-gray-300 bg-white p-2"
                >
                    <h4>Children:</h4>
                    {dragSource !== "sidebar" && (
                        <SortableContext
                            items={
                                watchedData.parentArray[
                                    parentIndex
                                ]?.childArray?.map((_, childIndex) =>
                                    getChildId(parentIndex, childIndex)
                                ) || []
                            }
                            strategy={verticalListSortingStrategy}
                        >
                            {watchedData.parentArray[
                                parentIndex
                            ]?.childArray.map(
                                (child: Child, childIndex: number) => (
                                    <ChildItem
                                        key={getChildId(
                                            parentIndex,
                                            childIndex
                                        )}
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
                            {watchedData.parentArray[
                                parentIndex
                            ]?.childArray.map(
                                (child: Child, childIndex: number) => (
                                    <ChildItem
                                        key={getChildId(
                                            parentIndex,
                                            childIndex
                                        )}
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
                        className="cursor-pointer rounded border-none bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                        onClick={() => addChild(parentIndex)}
                    >
                        Add Child
                    </button>
                </div>
            </div>

            {/* After ドロップインジケーター */}
            {showAfterIndicator && (
                <div
                    style={{
                        height: "3px",
                        backgroundColor: "#007bff",
                        marginTop: "8px",
                        borderRadius: "1px",
                    }}
                />
            )}
        </>
    );
}
