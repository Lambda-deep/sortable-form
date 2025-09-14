import type { ChildItemProps } from "../types";

export function ChildItem({
    parentIndex,
    childIndex,
    register,
    removeChild,
}: ChildItemProps) {
    return (
        <div
            data-testid="child-item"
            className="mb-2 flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2"
        >
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
            <button
                type="button"
                className="cursor-pointer rounded-sm border-none bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                onClick={() => removeChild(parentIndex, childIndex)}
            >
                ×
            </button>
        </div>
    );
}
