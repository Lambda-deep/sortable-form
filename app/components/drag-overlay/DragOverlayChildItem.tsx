import { forwardRef } from "react";
import type { Child } from "../../types";
import { ChildItemView } from "../form/ChildItemView";

interface DragOverlayChildItemProps {
    child: Child;
}

export const DragOverlayChildItem = forwardRef<
    HTMLDivElement,
    DragOverlayChildItemProps
>(({ child }, ref) => {
    return (
        <ChildItemView ref={ref} child={child} className="z-50 opacity-70" />
    );
});

DragOverlayChildItem.displayName = "DragOverlayChildItem";
