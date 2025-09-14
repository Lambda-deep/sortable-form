import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SidebarChildItemProps } from "../types";

export function SidebarChildItem({
    id,
    child,
    parentIndex,
    childIndex,
}: SidebarChildItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging, isOver } =
        useSortable({
            id,
            animateLayoutChanges: () => false, // アニメーションを無効にしてスナップを防ぐ
            disabled: false, // ドラッグを有効化
            transition: null, // トランジションを完全に無効化
        });

    const style = {
        // ドラッグ中はカーソルに追従させる
        transform: CSS.Transform.toString(transform),
        transition: "none", // 常にトランジションを無効
        // ドラッグ中は要素を見えるようにし、zIndexで前面に表示
        ...(isDragging && {
            zIndex: 1000,
            opacity: 0.9,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }),
        // ドロップインジケーター（ドラッグ中のみ表示）
        ...(isOver &&
            !isDragging && {
                borderTop: "3px solid #007bff",
                marginTop: "2px",
            }),
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                data-testid="sidebar-child-item"
                data-sortable-id={id}
                data-drag-source="sidebar"
                className="flex items-center gap-2 py-1"
            >
                <span
                    data-testid="sidebar-child-drag-handle"
                    className="cursor-grab text-gray-600 text-sm"
                    {...attributes}
                    {...listeners}
                >
                    ⋮
                </span>
                <span>
                    [{parentIndex}.{childIndex}] {child.childKey}
                </span>
            </div>
        </>
    );
}
