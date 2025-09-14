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
        <ParentItemView
            ref={ref}
            parent={parent}
            isReadOnly={true}
            style={{ opacity: 0.8 }}
            className="z-50"
        >
            {parent.childArray?.map((child, childIndex) => (
                <ChildItemView
                    key={childIndex}
                    child={child}
                    isReadOnly={true}
                    style={{ opacity: 0.8 }}
                />
            ))}
        </ParentItemView>
    );
});

DragOverlayParentItem.displayName = "DragOverlayParentItem";
