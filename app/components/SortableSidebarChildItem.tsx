import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SidebarChildItemProps } from "../types";

export function SidebarChildItem({
    id,
    child,
    parentIndex,
    childIndex,
    dragSource,
}: SidebarChildItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
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
                className="cursor-move text-gray-600 text-sm"
                {...attributes}
                {...listeners}
            >
                ⋮
            </span>
            <span>
                [{parentIndex}.{childIndex}] {child.childKey}
            </span>
        </div>
    );
}
