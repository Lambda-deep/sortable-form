import { forwardRef } from "react";
import type { Parent } from "../types";
import { ParentItemView } from "./ParentItemView";

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
                <div
                    key={childIndex}
                    className="mb-2 flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 shadow-sm"
                >
                    <div className="h-4 w-4" /> {/* DragHandle placeholder */}
                    <input
                        value={child.childKey}
                        readOnly
                        className="flex-1 rounded-sm border border-gray-400 px-1 py-1 text-sm"
                        placeholder="Child Key"
                    />
                    <input
                        value={child.childValue}
                        readOnly
                        className="flex-1 rounded-sm border border-gray-400 px-1 py-1 text-sm"
                        placeholder="Child Value"
                    />
                    <div className="px-2 py-1 text-sm">×</div>{" "}
                    {/* Button placeholder */}
                </div>
            ))}
        </ParentItemView>
    );
});

DragOverlayParentItem.displayName = "DragOverlayParentItem";
