import { forwardRef } from "react";
import type { Child } from "../types";
import Button from "./Button";
import DragHandle from "./DragHandle";

interface DragOverlayChildItemProps {
    child: Child;
}

export const DragOverlayChildItem = forwardRef<
    HTMLDivElement,
    DragOverlayChildItemProps
>(({ child }, ref) => {
    return (
        <div
            ref={ref}
            className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 shadow-sm"
        >
            <DragHandle data-testid="child-drag-handle" />
            <input
                value={child.childKey}
                readOnly
                className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                placeholder="Child Key"
            />
            <input
                value={child.childValue}
                readOnly
                className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                placeholder="Child Value"
            />
            <Button type="button" variant="remove" size="sm" onClick={() => {}}>
                ×
            </Button>
        </div>
    );
});

DragOverlayChildItem.displayName = "DragOverlayChildItem";
