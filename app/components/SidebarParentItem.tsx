import type { Child, SidebarParentItemProps } from "../types";
import { SidebarChildItem } from "./SidebarChildItem";
import DragHandle from "./DragHandle";

export function SidebarParentItem({
    parent,
    parentIndex,
}: SidebarParentItemProps) {
    return (
        <li
            data-testid="index-item"
            className="rounded border border-gray-300 bg-gray-50 p-1"
        >
            <div className="flex items-center gap-2">
                <DragHandle data-testid="sidebar-parent-drag-handle" />
                <strong>
                    [{parentIndex}] {parent.parentKey}
                </strong>
            </div>
            <div
                data-testid="nested-index"
                className="mt-1 ml-5 flex flex-col gap-1 rounded border border-gray-300 bg-white p-1 text-xs text-gray-600"
            >
                {parent.childArray.map((child: Child, childIndex: number) => (
                    <SidebarChildItem
                        key={`child-${parentIndex}-${childIndex}`}
                        child={child}
                        parentIndex={parentIndex}
                        childIndex={childIndex}
                    />
                ))}
            </div>
        </li>
    );
}
