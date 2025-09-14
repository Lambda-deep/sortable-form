import { useEffect, useRef } from "react";
import Sortable from "sortablejs";
import type { Child, SidebarParentItemProps } from "../types";
import { SidebarChildItem } from "./SidebarChildItem";
import DragHandle from "./DragHandle";

interface ExtendedSidebarParentItemProps extends SidebarParentItemProps {
    updateChildOrder?: (parentIndex: number, oldIndex: number, newIndex: number) => void;
    moveChildBetweenParents?: (fromParentIndex: number, toParentIndex: number, fromChildIndex: number, toChildIndex: number) => void;
    commonSortableConfig?: any;
    sidebarChildSortableRefs?: React.MutableRefObject<{ [key: number]: Sortable }>;
}

export function SidebarParentItem({
    parent,
    parentIndex,
    updateChildOrder,
    moveChildBetweenParents,
    commonSortableConfig,
    sidebarChildSortableRefs,
}: ExtendedSidebarParentItemProps) {
    const childrenContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only run on client side to avoid hydration issues
        if (typeof window === 'undefined') return;
        if (!childrenContainerRef.current) return;
        if (!updateChildOrder || !commonSortableConfig || !sidebarChildSortableRefs) return;

        // 既存のSortableインスタンスをクリーンアップ
        if (sidebarChildSortableRefs.current[parentIndex]) {
            sidebarChildSortableRefs.current[parentIndex].destroy();
        }

        // サイドバー子要素用のSortable設定
        const sidebarChildSortableConfig = {
            ...commonSortableConfig,
            group: "children", // フォームと同じグループ名
            onEnd: (evt: any) => {
                const fromParentIndex = parseInt(evt.from.dataset.parentIndex || "0", 10);
                const toParentIndex = parseInt(evt.to.dataset.parentIndex || "0", 10);
                const oldIndex = evt.oldIndex;
                const newIndex = evt.newIndex;

                if (fromParentIndex === toParentIndex) {
                    // 同じ親内での移動
                    updateChildOrder(fromParentIndex, oldIndex, newIndex);
                } else {
                    // 異なる親間での移動
                    moveChildBetweenParents!(fromParentIndex, toParentIndex, oldIndex, newIndex);
                }
            },
        };

        // Sortableインスタンスを作成
        const sortableInstance = Sortable.create(childrenContainerRef.current, sidebarChildSortableConfig);
        sidebarChildSortableRefs.current[parentIndex] = sortableInstance;

        return () => {
            if (sidebarChildSortableRefs.current && sidebarChildSortableRefs.current[parentIndex]) {
                sidebarChildSortableRefs.current[parentIndex].destroy();
                delete sidebarChildSortableRefs.current[parentIndex];
            }
        };
    }, [parentIndex, updateChildOrder, moveChildBetweenParents, commonSortableConfig, sidebarChildSortableRefs]);

    return (
        <li
            data-testid="index-item"
            data-parent-index={parentIndex}
            className="rounded border border-gray-300 bg-gray-50 p-1"
        >
            <div className="flex items-center gap-2">
                <DragHandle data-testid="sidebar-parent-drag-handle" />
                <strong>
                    [{parentIndex}] {parent.parentKey}
                </strong>
            </div>
            <div
                ref={childrenContainerRef}
                data-testid="nested-index"
                data-parent-index={parentIndex}
                className="mt-1 ml-5 flex flex-col gap-1 rounded border border-gray-300 bg-white p-1 text-xs text-gray-600"
            >
                {parent.childArray.map((child: Child, childIndex: number) => (
                    <SidebarChildItem
                        key={`${parentIndex}-${child.childKey}-${childIndex}`}
                        child={child}
                        parentIndex={parentIndex}
                        childIndex={childIndex}
                    />
                ))}
            </div>
        </li>
    );
}
