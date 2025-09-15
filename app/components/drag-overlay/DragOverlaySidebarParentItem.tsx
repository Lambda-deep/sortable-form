import { forwardRef } from "react";
import type { Parent } from "../../types";
import { SidebarParentItemView } from "../sidebar/SidebarParentItemView";
import { SidebarChildItemView } from "../sidebar/SidebarChildItemView";

interface DragOverlaySidebarParentItemProps {
    parent: Parent;
    parentIndex: number;
}

export const DragOverlaySidebarParentItem = forwardRef<
    HTMLDivElement,
    DragOverlaySidebarParentItemProps
>(({ parent, parentIndex }, ref) => {
    return (
        <SidebarParentItemView
            ref={ref}
            parent={parent}
            parentIndex={parentIndex}
            className="z-50 opacity-70"
        >
            {parent.childArray?.map((child, childIndex) => (
                <SidebarChildItemView
                    key={childIndex}
                    child={child}
                    parentIndex={parentIndex}
                    childIndex={childIndex}
                />
            ))}
        </SidebarParentItemView>
    );
});

DragOverlaySidebarParentItem.displayName = "DragOverlaySidebarParentItem";
