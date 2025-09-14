import { useSortable } from "@dnd-kit/sortable";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ParentItemProps } from "../types";
import { ChildItem } from "./ChildItem";
import { ParentItemView } from "./ParentItemView";

export function ParentItem({
    parentIndex,
    parentFieldId,
    register,
    removeParent,
    watchedData,
    addChild,
    removeChild,
    dragState,
}: ParentItemProps) {
    const currentParent = watchedData.parentArray[parentIndex];

    // useFieldArrayからの実際のIDを使用
    const parentId = parentFieldId;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
    } = useSortable({ id: parentId });

    // ドロップインジケーターの表示判定
    const showDropIndicator = dragState.dropIndicator?.targetId === parentId;
    const dropPosition = dragState.dropIndicator?.position || "before";

    const style = {
        transform: isSorting ? undefined : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    const showDropIndicatorStates = {
        before: showDropIndicator && dropPosition === "before",
        after: showDropIndicator && dropPosition === "after",
        inside: showDropIndicator && dropPosition === "inside",
    };

    return (
        <ParentItemView
            ref={setNodeRef}
            parent={currentParent}
            style={style}
            className={isDragging ? "z-50 shadow-2xl" : ""}
            showDropIndicator={showDropIndicatorStates}
            dragHandleProps={{ attributes, listeners }}
            onRemove={() => removeParent(parentIndex)}
            onAddChild={() => addChild(parentIndex)}
            registerParentKey={register(`parentArray.${parentIndex}.parentKey`)}
            registerParentValue={register(
                `parentArray.${parentIndex}.parentValue`
            )}
        >
            <SortableContext
                items={
                    currentParent?.childArray?.map(
                        (_, childIndex) => `${parentIndex}-${childIndex}`
                    ) || []
                }
                strategy={verticalListSortingStrategy}
            >
                {currentParent?.childArray?.map((_, childIndex: number) => (
                    <ChildItem
                        key={`${parentIndex}-${childIndex}`}
                        parentIndex={parentIndex}
                        childIndex={childIndex}
                        register={register}
                        removeChild={removeChild}
                        dragState={dragState}
                    />
                ))}
            </SortableContext>
        </ParentItemView>
    );
}
