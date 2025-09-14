import type { Child } from "../types";
import { SidebarChildItemView } from "./SidebarChildItemView";

interface DragOverlaySidebarChildItemProps {
    child: Child;
    parentIndex: number;
    childIndex: number;
}

export function DragOverlaySidebarChildItem({
    child,
    parentIndex,
    childIndex,
}: DragOverlaySidebarChildItemProps) {
    return (
        <SidebarChildItemView
            child={child}
            parentIndex={parentIndex}
            childIndex={childIndex}
            className="shadow-lg"
        />
    );
}
