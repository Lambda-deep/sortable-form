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
            className="border border-gray-300 p-4 mb-4 rounded bg-gray-50"
        >
            <div
                className="flex gap-2 items-center mb-2"
                {...attributes}
                {...listeners}
            >
                <span
                    data-testid="parent-drag-handle"
                    className="cursor-move text-gray-600 text-lg"
                >
                    ⋮⋮
                </span>
                <input
                    {...register(`parentArray.${parentIndex}.parentKey`)}
                    className="flex-1 px-2 py-1 border border-gray-400 rounded"
                    placeholder="Parent Key"
                />
                <input
                    {...register(`parentArray.${parentIndex}.parentValue`)}
                    className="flex-1 px-2 py-1 border border-gray-400 rounded"
                    placeholder="Parent Value"
                />
                <button
                    type="button"
                    className="bg-red-600 text-white border-none px-2 py-1 rounded-sm cursor-pointer text-xs hover:bg-red-700"
                    onClick={() => removeParent(parentIndex)}
                >
                    Remove
                </button>
            </div>

            <div
                data-testid="children-container"
                className="mt-4 p-2 bg-white rounded border border-gray-300"
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
                    className="bg-blue-600 text-white border-none px-3 py-2 rounded cursor-pointer hover:bg-blue-700"
                    onClick={() => addChild(parentIndex)}
                >
                    Add Child
                </button>
            </div>
        </div>
    );
}
