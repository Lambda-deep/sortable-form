import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Data, Child, SortableParentItemProps } from "../types";
import { SortableChildItem } from "./SortableChildItem";

export function SortableParentItem({
    parentField,
    parentIndex,
    register,
    removeParent,
    watchedData,
    addChild,
    removeChild,
}: SortableParentItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: parentField.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-testid="parent-item"
            className="parent-item"
        >
            <div className="parent-header" {...attributes} {...listeners}>
                <span
                    data-testid="parent-drag-handle"
                    className="drag-handle parent-drag-handle"
                >
                    ⋮⋮
                </span>
                <input
                    {...register(`parentArray.${parentIndex}.parentKey`)}
                    className="parent-input"
                    placeholder="Parent Key"
                />
                <input
                    {...register(`parentArray.${parentIndex}.parentValue`)}
                    className="parent-input"
                    placeholder="Parent Value"
                />
                <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeParent(parentIndex)}
                >
                    Remove
                </button>
            </div>

            <div
                data-testid="children-container"
                className="children-container"
            >
                <h4>Children:</h4>
                <SortableContext
                    items={
                        watchedData.parentArray[parentIndex]?.childArray?.map(
                            (child, childIndex) =>
                                `${parentIndex}-${childIndex}`
                        ) || []
                    }
                    strategy={verticalListSortingStrategy}
                >
                    {watchedData.parentArray[parentIndex]?.childArray.map(
                        (child: Child, childIndex: number) => (
                            <SortableChildItem
                                key={`${parentIndex}-${childIndex}`}
                                id={`${parentIndex}-${childIndex}`}
                                child={child}
                                parentIndex={parentIndex}
                                childIndex={childIndex}
                                register={register}
                                removeChild={removeChild}
                            />
                        )
                    )}
                </SortableContext>
                <button
                    type="button"
                    className="add-button"
                    onClick={() => addChild(parentIndex)}
                >
                    Add Child
                </button>
            </div>
        </div>
    );
}
