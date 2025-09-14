import { forwardRef } from "react";
import type { Parent } from "../types";
import { SidebarParentItemView } from "./SidebarParentItemView";
import { SidebarChildItemView } from "./SidebarChildItemView";

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
            style={{ opacity: 0.9 }}
            className="z-50 shadow-2xl"
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
