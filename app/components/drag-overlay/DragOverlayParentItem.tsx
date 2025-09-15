import { forwardRef } from "react";
import type { Parent } from "../../types";
import { ParentItemView } from "../form/ParentItemView";
import { ChildItemView } from "../form/ChildItemView";

interface DragOverlayParentItemProps {
    parent: Parent;
    parentIndex: number;
}

export const DragOverlayParentItem = forwardRef<
    HTMLDivElement,
    DragOverlayParentItemProps
>(({ parent }, ref) => {
    return (
        <ParentItemView ref={ref} parent={parent} className="z-50 opacity-70">
            {parent.childArray?.map((child, childIndex) => (
                <ChildItemView key={childIndex} child={child} />
            ))}
        </ParentItemView>
    );
});

DragOverlayParentItem.displayName = "DragOverlayParentItem";
