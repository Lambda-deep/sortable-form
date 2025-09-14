import type { SidebarChildItemProps } from "../types";
import DragHandle from "./DragHandle";

export function SidebarChildItem({
    child,
    parentIndex,
    childIndex,
}: SidebarChildItemProps) {
    return (
        <div
            data-testid="sidebar-child-item"
            className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 py-1"
        >
            <DragHandle data-testid="sidebar-child-drag-handle" />
            <span>
                [{parentIndex}.{childIndex}] {child.childKey}
            </span>
        </div>
    );
}
