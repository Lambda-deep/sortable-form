import { forwardRef } from "react";
import type { Child } from "../types";
import { ChildItemView } from "./ChildItemView";

interface DragOverlayChildItemProps {
    child: Child;
}

export const DragOverlayChildItem = forwardRef<
    HTMLDivElement,
    DragOverlayChildItemProps
>(({ child }, ref) => {
    return (
        <ChildItemView
            ref={ref}
            child={child}
            isReadOnly={true}
            style={{ opacity: 0.8 }}
            className="z-50"
        />
    );
});

DragOverlayChildItem.displayName = "DragOverlayChildItem";
