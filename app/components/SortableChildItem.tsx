import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SortableChildItemProps } from "../types";

export function SortableChildItem({
    id,
    child,
    parentIndex,
    childIndex,
    register,
    removeChild,
    dragSource,
}: SortableChildItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-testid="child-item"
            data-sortable-id={id}
            data-drag-source="form"
            className="flex gap-2 items-center p-2 mb-2 bg-gray-50 border border-gray-300 rounded cursor-move"
        >
            <span
                data-testid="drag-handle"
                className="cursor-move text-gray-600 text-lg"
                {...attributes}
                {...listeners}
            >
                ⋮
            </span>
            <input
                {...register(
                    `parentArray.${parentIndex}.childArray.${childIndex}.childKey`
                )}
                className="flex-1 px-1 py-1 border border-gray-400 rounded-sm"
                placeholder="Child Key"
            />
            <input
                {...register(
                    `parentArray.${parentIndex}.childArray.${childIndex}.childValue`
                )}
                className="flex-1 px-1 py-1 border border-gray-400 rounded-sm"
                placeholder="Child Value"
            />
            <button
                type="button"
                className="bg-red-600 text-white border-none px-2 py-1 rounded-sm cursor-pointer text-xs hover:bg-red-700"
                onClick={() => removeChild(parentIndex, childIndex)}
            >
                ×
            </button>
        </div>
    );
}
