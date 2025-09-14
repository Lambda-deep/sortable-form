import type { ChildItemProps } from "../types";
import Button from "./Button";
import DragHandle from "./DragHandle";

export function ChildItem({
    parentIndex,
    childIndex,
    register,
    removeChild,
}: ChildItemProps) {
    return (
        <div
            data-testid="child-item"
            className="flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2"
        >
            <DragHandle data-testid="drag-handle" />
            <input
                {...register(
                    `parentArray.${parentIndex}.childArray.${childIndex}.childKey` as const
                )}
                className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                placeholder="Child Key"
            />
            <input
                {...register(
                    `parentArray.${parentIndex}.childArray.${childIndex}.childValue` as const
                )}
                className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                placeholder="Child Value"
            />
            <Button
                type="button"
                variant="remove"
                size="sm"
                onClick={() => removeChild(parentIndex, childIndex)}
            >
                ×
            </Button>
        </div>
    );
}
