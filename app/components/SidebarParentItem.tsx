import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Child, SidebarParentItemProps } from "../types";
import { SidebarChildItem } from "./SidebarChildItem";

export function SidebarParentItem({
    parentField,
    parent,
    parentIndex,
    dragSource,
    getSidebarChildId = (parentIndex, childIndex) =>
        `sidebar-${parentIndex}-${childIndex}`,
    dragOverId,
    dragOverPosition,
}: SidebarParentItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useSortable({
            id: parentField.id,
            animateLayoutChanges: () => false, // アニメーションを無効にしてスナップを防ぐ
            disabled: false, // ドラッグを有効化
            transition: null, // トランジションを完全に無効化
        });

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
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }),
    };

    return (
        <>
            {/* Before ドロップインジケーター */}
            {showBeforeIndicator && (
                <div
                    style={{
                        height: "3px",
                        backgroundColor: "#007bff",
                        marginBottom: "4px",
                        borderRadius: "1px",
                    }}
                />
            )}

            <li
                ref={setNodeRef}
                style={style}
                data-testid="index-item"
                data-sortable-id={parentField.id}
                data-drag-source="sidebar"
                className="mb-1 rounded border border-gray-400 bg-gray-100 p-2 text-sm"
            >
                <div
                    className="flex cursor-grab items-center gap-2"
                    {...attributes}
                    {...listeners}
                >
                    <span
                        data-testid="sidebar-parent-drag-handle"
                        className="cursor-grab text-base text-gray-600"
                    >
                        ⋮⋮
                    </span>
                    <strong>
                        [{parentIndex}] {parent.parentKey}
                    </strong>
                </div>
                {dragSource !== "form" && (
                    <SortableContext
                        items={
                            parent.childArray?.map((_, childIndex) =>
                                getSidebarChildId(parentIndex, childIndex)
                            ) || []
                        }
                        strategy={verticalListSortingStrategy}
                    >
                        <div
                            data-testid="nested-index"
                            className="mt-1 ml-5 text-xs text-gray-600"
                        >
                            {parent.childArray.map(
                                (child: Child, childIndex: number) => (
                                    <SidebarChildItem
                                        key={`sidebar-child-${parentIndex}-${child.childKey}`}
                                        id={getSidebarChildId(
                                            parentIndex,
                                            childIndex
                                        )}
                                        child={child}
                                        parentIndex={parentIndex}
                                        childIndex={childIndex}
                                        dragSource={dragSource}
                                    />
                                )
                            )}
                        </div>
                    </SortableContext>
                )}
                {dragSource === "form" && (
                    <div
                        data-testid="nested-index"
                        className="mt-1 ml-5 text-xs text-gray-600"
                    >
                        {parent.childArray.map(
                            (child: Child, childIndex: number) => (
                                <SidebarChildItem
                                    key={`sidebar-child-${parentIndex}-${child.childKey}`}
                                    id={getSidebarChildId(
                                        parentIndex,
                                        childIndex
                                    )}
                                    child={child}
                                    parentIndex={parentIndex}
                                    childIndex={childIndex}
                                    dragSource={dragSource}
                                />
                            )
                        )}
                    </div>
                )}
            </li>

            {/* After ドロップインジケーター */}
            {showAfterIndicator && (
                <div
                    style={{
                        height: "3px",
                        backgroundColor: "#007bff",
                        marginTop: "4px",
                        borderRadius: "1px",
                    }}
                />
            )}
        </>
    );
}
