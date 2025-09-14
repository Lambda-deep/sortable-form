interface DropIndicatorProps {
    position: "before" | "after" | "inside";
    isVisible: boolean;
}

export function DropIndicator({ position, isVisible }: DropIndicatorProps) {
    if (!isVisible) return null;

    const indicatorClass =
        position === "inside"
            ? "absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-30 rounded"
            : "absolute left-0 right-0 h-1 bg-blue-500 rounded-full z-20";

    const positionClass =
        position === "before"
            ? "-top-1"
            : position === "after"
              ? "-bottom-1"
              : "";

    return <div className={`${indicatorClass} ${positionClass}`} />;
}
