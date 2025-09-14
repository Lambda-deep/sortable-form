import { forwardRef } from "react";
import type { Parent } from "../types";
import Button from "./Button";
import DragHandle from "./DragHandle";

interface DragOverlayParentItemProps {
    parent: Parent;
    parentIndex: number;
}

export const DragOverlayParentItem = forwardRef<
    HTMLDivElement,
    DragOverlayParentItemProps
>(function DragOverlayParentItem({ parent }, ref) {
    const style = {
        opacity: 0.8,
    };

    return (
        <div
            ref={ref}
            style={style}
            className="relative z-50 rounded border border-gray-300 bg-gray-50 p-4 shadow-sm"
        >
            <div className="flex items-center gap-2">
                <DragHandle className="cursor-grabbing" />
                <input
                    value={parent.parentKey}
                    className="flex-1 rounded border border-gray-400 px-2 py-1"
                    placeholder="Parent Key"
                    readOnly
                />
                <input
                    value={parent.parentValue}
                    className="flex-1 rounded border border-gray-400 px-2 py-1"
                    placeholder="Parent Value"
                    readOnly
                />
                <Button type="button" variant="remove" size="sm">
                    Remove
                </Button>
            </div>

            <div className="mt-2 flex flex-col gap-2 rounded border border-gray-300 bg-white p-2">
                {parent.childArray?.map((child, childIndex: number) => (
                    <div
                        key={childIndex}
                        className="flex items-center gap-2 rounded border border-gray-200 bg-white p-2"
                    >
                        <DragHandle className="cursor-grabbing text-xs" />
                        <input
                            value={child.childKey}
                            className="flex-1 rounded border border-gray-400 px-2 py-1 text-sm"
                            placeholder="Child Key"
                            readOnly
                        />
                        <input
                            value={child.childValue}
                            className="flex-1 rounded border border-gray-400 px-2 py-1 text-sm"
                            placeholder="Child Value"
                            readOnly
                        />
                        <Button type="button" variant="remove" size="sm">
                            Remove
                        </Button>
                    </div>
                ))}
            </div>
            <Button type="button" variant="add" size="sm" className="mt-2">
                Add Child
            </Button>
        </div>
    );
});
