import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SidebarChildItemProps } from "../../types";
import { SidebarChildItemView } from "./SidebarChildItemView";

export function SidebarChildItem({
    child,
    parentIndex,
    childIndex,
    dragState,
}: SidebarChildItemProps) {
    // 子要素のIDを生成（サイドバー専用のプレフィックスを追加）
    const childId = `sidebar-${parentIndex}-${childIndex}`;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
    } = useSortable({
        id: childId,
        data: {
            parentIndex,
            childIndex,
            type: "child",
            source: "sidebar",
        },
    });

    // ドロップインジケーターの表示判定
    const showDropIndicator = dragState.dropIndicator?.targetId === childId;
    const dropPosition = dragState.dropIndicator?.position || "before";

    const style = {
        transform: isSorting ? undefined : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    const showDropIndicatorStates = {
        before: showDropIndicator && dropPosition === "before",
        after: showDropIndicator && dropPosition === "after",
    };

    return (
        <SidebarChildItemView
            ref={setNodeRef}
            child={child}
            parentIndex={parentIndex}
            childIndex={childIndex}
            style={style}
            className={isDragging ? "z-50" : ""}
            showDropIndicator={showDropIndicatorStates}
            dragHandleProps={{ attributes, listeners }}
        />
    );
}
