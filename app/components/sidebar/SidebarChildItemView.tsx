import { forwardRef, type CSSProperties } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { Child } from "../../types";
import DragHandle from "../ui/DragHandle";
import { DropIndicator } from "../ui/DropIndicator";

interface SidebarChildItemViewProps {
    child: Child;
    parentIndex: number;
    childIndex: number;
    dragHandleProps?: {
        attributes: DraggableAttributes;
        listeners: SyntheticListenerMap | undefined;
    };
    showDropIndicator?: {
        before?: boolean;
        after?: boolean;
    };
    className?: string;
    style?: CSSProperties;
}

export const SidebarChildItemView = forwardRef<
    HTMLDivElement,
    SidebarChildItemViewProps
>(
    (
        {
            child,
            parentIndex,
            childIndex,
            dragHandleProps,
            showDropIndicator = {},
            className = "",
            style,
        },
        ref
    ) => {
        return (
            <div className="relative">
                {/* ドロップインジケーター - 前 */}
                <div className="absolute -top-0.5 right-0 left-0 z-10">
                    <DropIndicator
                        position="before"
                        isVisible={showDropIndicator.before || false}
                    />
                </div>

                <div
                    ref={ref}
                    style={style}
                    data-testid="sidebar-child-item"
                    className={`flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-1 ${className}`}
                >
                    <DragHandle
                        data-testid="sidebar-child-drag-handle"
                        attributes={dragHandleProps?.attributes}
                        listeners={dragHandleProps?.listeners}
                    />
                    <span>
                        [{parentIndex}.{childIndex}] {child.childKey}
                    </span>
                </div>

                {/* ドロップインジケーター - 後 */}
                <div className="absolute right-0 -bottom-0.5 left-0 z-10">
                    <DropIndicator
                        position="after"
                        isVisible={showDropIndicator.after || false}
                    />
                </div>
            </div>
        );
    }
);

SidebarChildItemView.displayName = "SidebarChildItemView";
