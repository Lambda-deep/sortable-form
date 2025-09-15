import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChildItemProps } from "../../types";
import { ChildItemView } from "./ChildItemView";

export function ChildItem({
    parentIndex,
    childIndex,
    register,
    removeChild,
    dragState,
}: ChildItemProps) {
    // Child IDを `parentIndex-childIndex` 形式で生成
    const childId = `${parentIndex}-${childIndex}`;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
    } = useSortable({ id: childId });

    // ドロップインジケーターの表示判定
    const showDropIndicator = dragState.dropIndicator?.targetId === childId;
    const dropPosition = dragState.dropIndicator?.position || "before";

    const style = {
        transform: isSorting ? undefined : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    const showDropIndicatorState = showDropIndicator ? dropPosition : null;

    return (
        <ChildItemView
            ref={setNodeRef}
            style={style}
            className={isDragging ? "z-50" : ""}
            showDropIndicator={showDropIndicatorState}
            dragHandleProps={{ attributes, listeners }}
            onRemove={() => removeChild(parentIndex, childIndex)}
            registerChildKey={register(
                `parentArray.${parentIndex}.childArray.${childIndex}.childKey` as const
            )}
            registerChildValue={register(
                `parentArray.${parentIndex}.childArray.${childIndex}.childValue` as const
            )}
        />
    );
}
