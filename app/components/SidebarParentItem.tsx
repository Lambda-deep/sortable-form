import type { Child, SidebarParentItemProps } from "../types";
import { SidebarChildItem } from "./SidebarChildItem";

export function SidebarParentItem({
    parent,
    parentIndex,
}: SidebarParentItemProps) {
    return (
        <li data-testid="sidebar-parent-item" className="mb-2">
            <div className="flex items-center gap-2">
                <strong>
                    [{parentIndex}] {parent.parentKey}
                </strong>
            </div>
            <div
                data-testid="nested-index"
                className="mt-1 ml-5 text-xs text-gray-600"
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
