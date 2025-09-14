import type { SidebarChildItemProps } from "../types";
import { SidebarChildItemView } from "./SidebarChildItemView";

export function SidebarChildItem({
    child,
    parentIndex,
    childIndex,
    dragState,
}: SidebarChildItemProps) {
    // 子要素のIDを生成
    const childId = `${parentIndex}-${childIndex}`;

    // ドロップインジケーターの表示判定
    const showDropIndicator = dragState.dropIndicator?.targetId === childId;
    const dropPosition = dragState.dropIndicator?.position || "before";

    const showDropIndicatorStates = {
        before: showDropIndicator && dropPosition === "before",
        after: showDropIndicator && dropPosition === "after",
    };

    return (
        <SidebarChildItemView
            child={child}
            parentIndex={parentIndex}
            childIndex={childIndex}
            showDropIndicator={showDropIndicatorStates}
        />
    );
}
