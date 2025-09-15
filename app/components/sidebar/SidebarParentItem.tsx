import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Child, SidebarParentItemProps } from "../../types";
import { SidebarParentItemView } from "./SidebarParentItemView";
import { SidebarChildItem } from "./SidebarChildItem";

export function SidebarParentItem({
    parent,
    parentIndex,
    parentId,
    dragState,
}: SidebarParentItemProps) {
    // parentIdをそのまま使用（プレフィックスは_index.tsxで追加済み）
    const sidebarId = parentId;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting,
    } = useSortable({
        id: sidebarId,
        data: {
            index: parentIndex,
            type: "parent",
            source: "sidebar",
        },
    });

    // サイドバー子コンテナ用のドロップ可能エリア
    const { setNodeRef: setDropRef } = useDroppable({
        id: `${sidebarId}-container`,
    });

    // ドロップインジケーターの表示判定
    const showDropIndicator = dragState.dropIndicator?.targetId === sidebarId;
    const dropPosition = dragState.dropIndicator?.position || "before";

    const style = {
        transform: isSorting ? undefined : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    const showDropIndicatorState = showDropIndicator ? dropPosition : null;

    // サイドバーChild要素のIDリストを生成
    const sidebarChildIds = parent.childArray.map(
        (_, childIndex) => `sidebar-${parentIndex}-${childIndex}`
    );

    return (
        <li>
            <SidebarParentItemView
                ref={setNodeRef}
                parent={parent}
                parentIndex={parentIndex}
                style={style}
                showDropIndicator={showDropIndicatorState}
                dragHandleProps={{
                    attributes,
                    listeners,
                }}
                className={isDragging ? "z-50" : ""}
                childrenContainerRef={setDropRef}
            >
                <SortableContext
                    items={sidebarChildIds}
                    strategy={verticalListSortingStrategy}
                >
                    {parent.childArray.map(
                        (child: Child, childIndex: number) => (
                            <SidebarChildItem
                                key={`sidebar-child-${parentIndex}-${childIndex}`}
                                child={child}
                                parentIndex={parentIndex}
                                childIndex={childIndex}
                                dragState={dragState}
                            />
                        )
                    )}
                </SortableContext>
            </SidebarParentItemView>
        </li>
    );
}
