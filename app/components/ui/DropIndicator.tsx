import { cn } from "../../lib/utils";

interface DropIndicatorProps {
    position: "before" | "after";
    isVisible: boolean;
}

export function DropIndicator({ position, isVisible }: DropIndicatorProps) {
    if (!isVisible) return null;

    const positionClass = position === "before" ? "-top-1" : "-bottom-1";

    return (
        <div
            className={cn(
                "absolute right-0 left-0 z-20 h-1 rounded-full bg-blue-500",
                positionClass
            )}
        />
    );
}
