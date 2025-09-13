import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Child, SortableSidebarParentItemProps } from "../types";
import { SortableSidebarChildItem } from "./SortableSidebarChildItem";

export function SortableSidebarParentItem({
    parentField,
    parent,
    parentIndex,
}: SortableSidebarParentItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: parentField.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            data-testid="index-item"
            className="p-2 mb-1 bg-gray-100 border border-gray-400 rounded text-sm"
        >
            <div
                className="flex items-center gap-2 cursor-move"
                {...attributes}
                {...listeners}
            >
                <span
                    data-testid="sidebar-parent-drag-handle"
                    className="cursor-move text-gray-600 text-base"
                >
                    ⋮⋮
                </span>
                <strong>
                    [{parentIndex}] {parent.parentKey}
                </strong>
            </div>
            <SortableContext
                items={
                    parent.childArray?.map(
                        (_, childIndex) => `${parentIndex}-${childIndex}`
                    ) || []
                }
                strategy={verticalListSortingStrategy}
            >
                <div
                    data-testid="nested-index"
                    className="ml-5 mt-1 text-xs text-gray-600"
                >
                    {parent.childArray.map(
                        (child: Child, childIndex: number) => (
                            <SortableSidebarChildItem
                                key={`sidebar-child-${parentIndex}-${child.childKey}`}
                                id={`${parentIndex}-${childIndex}`}
                                child={child}
                                parentIndex={parentIndex}
                                childIndex={childIndex}
                            />
                        )
                    )}
                </div>
            </SortableContext>
        </li>
    );
}
