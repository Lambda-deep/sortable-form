import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SortableSidebarChildItemProps } from "../types";

export function SortableSidebarChildItem({
    id,
    child,
    parentIndex,
    childIndex,
}: SortableSidebarChildItemProps) {
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
            className="sidebar-child-item"
        >
            <span
                data-testid="sidebar-child-drag-handle"
                className="drag-handle sidebar-child-drag-handle"
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
