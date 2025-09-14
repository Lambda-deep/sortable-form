import type { ParentItemProps } from "../types";
import { ChildItem } from "./ChildItem";

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
            className="mb-4 rounded border border-gray-300 bg-gray-50 p-4"
        >
            <div className="mb-2 flex items-center gap-2">
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
                <button
                    type="button"
                    className="cursor-pointer rounded-sm border-none bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                    onClick={() => removeParent(parentIndex)}
                >
                    Remove
                </button>
            </div>

            <div
                data-testid="children-container"
                className="mt-4 rounded border border-gray-300 bg-white p-2"
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
                <button
                    type="button"
                    className="cursor-pointer rounded border-none bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                    onClick={() => addChild(parentIndex)}
                >
                    Add Child
                </button>
            </div>
        </div>
    );
}
