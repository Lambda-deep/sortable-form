import React from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { cn } from "../lib/utils";

interface DragHandleProps {
    "data-testid"?: string;
    className?: string;
    attributes?: DraggableAttributes;
    listeners?: SyntheticListenerMap | undefined;
}

const DragHandle: React.FC<DragHandleProps> = ({
    "data-testid": testId,
    className,
    attributes,
    listeners,
}) => {
    const baseClasses =
        "flex cursor-grab active:cursor-grabbing items-center justify-center rounded border border-dashed px-2 text-gray-500 hover:text-gray-700 touch-none select-none";

    return (
        <button
            type="button"
            data-testid={testId}
            className={cn(baseClasses, className)}
            {...attributes}
            {...listeners}
        >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM12 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM12 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM12 10a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM12 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
        </button>
    );
};

export default DragHandle;
