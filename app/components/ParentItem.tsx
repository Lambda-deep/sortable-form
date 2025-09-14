import type { ParentItemProps } from "../types";
import { ChildItem } from "./ChildItem";
import Button from "./Button";
import DragHandle from "./DragHandle";

export function ParentItem({
    parentIndex,
    register,
    removeParent,
    watchedData,
    addChild,
    removeChild,
}: ParentItemProps) {
    const currentParent = watchedData.parentArray[parentIndex];

    return (
        <div
            data-testid="parent-item"
            className="rounded border border-gray-300 bg-gray-50 p-4"
        >
            <div className="flex items-center gap-2">
                <DragHandle data-testid="parent-drag-handle" />
                <input
                    {...register(`parentArray.${parentIndex}.parentKey`)}
                    className="flex-1 rounded border border-gray-400 px-2 py-1"
                    placeholder="Parent Key"
                />
                <input
                    {...register(`parentArray.${parentIndex}.parentValue`)}
                    className="flex-1 rounded border border-gray-400 px-2 py-1"
                    placeholder="Parent Value"
                />
                <Button
                    type="button"
                    variant="remove"
                    size="sm"
                    onClick={() => removeParent(parentIndex)}
                >
                    Remove
                </Button>
            </div>

            <div
                data-testid="children-container"
                className="mt-2 flex flex-col gap-2 rounded border border-gray-300 bg-white p-2"
            >
                {currentParent?.childArray?.map((_, childIndex: number) => (
                    <ChildItem
                        key={childIndex}
                        parentIndex={parentIndex}
                        childIndex={childIndex}
                        register={register}
                        removeChild={removeChild}
                    />
                ))}
            </div>
            <Button
                type="button"
                variant="add"
                size="sm"
                className="mt-2"
                onClick={() => addChild(parentIndex)}
            >
                Add Child
            </Button>
        </div>
    );
}
