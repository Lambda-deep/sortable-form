import React from "react";
import { cn } from "../lib/utils";

interface DragHandleProps {
    "data-testid": string;
    className?: string;
}

const DragHandle: React.FC<DragHandleProps> = ({
    "data-testid": testId,
    className,
}) => {
    const baseClasses =
        "flex cursor-grab items-center justify-center rounded border border-dashed px-2 text-gray-500 hover:text-gray-700";

    return (
        <div data-testid={testId} className={cn(baseClasses, className)}>
            ⋮
        </div>
    );
};

export default DragHandle;
