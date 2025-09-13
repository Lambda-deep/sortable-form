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
            className="child-item"
        >
            <span
                data-testid="drag-handle"
                className="drag-handle"
                {...attributes}
                {...listeners}
            >
                ⋮
            </span>
            <input
                {...register(
                    `parentArray.${parentIndex}.childArray.${childIndex}.childKey`
                )}
                className="child-input"
                placeholder="Child Key"
            />
            <input
                {...register(
                    `parentArray.${parentIndex}.childArray.${childIndex}.childValue`
                )}
                className="child-input"
                placeholder="Child Value"
            />
            <button
                type="button"
                className="remove-button"
                onClick={() => removeChild(parentIndex, childIndex)}
            >
                ×
            </button>
        </div>
    );
}
