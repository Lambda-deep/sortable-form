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
        <li ref={setNodeRef} style={style} className="index-item">
            <div
                className="sidebar-parent-header"
                {...attributes}
                {...listeners}
            >
                <span className="drag-handle sidebar-parent-drag-handle">
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
                <div className="nested-index">
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
