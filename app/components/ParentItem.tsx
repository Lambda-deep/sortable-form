import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Data, Child, ParentItemProps } from "../types";
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
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({
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

    // プレースホルダーのスタイル（ドラッグ中の空白用）
    const placeholderStyle = {
        ...(isDragging &&
            originalSize && {
                width: `${originalSize.width}px`,
                height: `${originalSize.height}px`,
                visibility: "hidden" as const,
                pointerEvents: "none" as const,
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
                className="border border-gray-300 p-4 mb-4 rounded bg-gray-50"
            >
                <div
                    className="flex gap-2 items-center mb-2"
                    {...attributes}
                    {...listeners}
                >
                    <span
                        data-testid="parent-drag-handle"
                        className="flex items-center justify-center cursor-grab text-gray-600 w-4 h-4 text-lg"
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
                        className="bg-blue-600 text-white border-none px-3 py-2 rounded cursor-pointer hover:bg-blue-700"
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
