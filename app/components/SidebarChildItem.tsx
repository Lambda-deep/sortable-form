import type { SidebarChildItemProps } from "../types";

export function SidebarChildItem({
    child,
    parentIndex,
    childIndex,
}: SidebarChildItemProps) {
    return (
        <div
            data-testid="sidebar-child-item"
            className="flex items-center gap-2 py-1"
        >
            <span>
                [{parentIndex}.{childIndex}] {child.childKey}
            </span>
        </div>
    );
}
