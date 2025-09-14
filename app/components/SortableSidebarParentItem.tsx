import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Child, SidebarParentItemProps } from "../types";
import { SidebarChildItem } from "./SortableSidebarChildItem";

export function SidebarParentItem({
    parentField,
    parent,
    parentIndex,
    dragSource,
    getSidebarChildId = (parentIndex, childIndex) =>
        `sidebar-${parentIndex}-${childIndex}`,
}: SidebarParentItemProps) {
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
            data-sortable-id={parentField.id}
            data-drag-source="sidebar"
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
            {dragSource !== "form" && (
                <SortableContext
                    items={
                        parent.childArray?.map((_, childIndex) =>
                            getSidebarChildId(parentIndex, childIndex)
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
                                <SidebarChildItem
                                    key={`sidebar-child-${parentIndex}-${child.childKey}`}
                                    id={getSidebarChildId(
                                        parentIndex,
                                        childIndex
                                    )}
                                    child={child}
                                    parentIndex={parentIndex}
                                    childIndex={childIndex}
                                    dragSource={dragSource}
                                />
                            )
                        )}
                    </div>
                </SortableContext>
            )}
            {dragSource === "form" && (
                <div
                    data-testid="nested-index"
                    className="ml-5 mt-1 text-xs text-gray-600"
                >
                    {parent.childArray.map(
                        (child: Child, childIndex: number) => (
                            <SidebarChildItem
                                key={`sidebar-child-${parentIndex}-${child.childKey}`}
                                id={getSidebarChildId(parentIndex, childIndex)}
                                child={child}
                                parentIndex={parentIndex}
                                childIndex={childIndex}
                                dragSource={dragSource}
                            />
                        )
                    )}
                </div>
            )}
        </li>
    );
}
