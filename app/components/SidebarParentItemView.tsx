import { forwardRef, type ReactNode, type CSSProperties } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { Parent } from "../types";
import DragHandle from "./DragHandle";
import { DropIndicator } from "./DropIndicator";

interface SidebarParentItemViewProps {
    parent: Parent;
    parentIndex: number;
    children?: ReactNode;
    dragHandleProps?: {
        attributes: DraggableAttributes;
        listeners: SyntheticListenerMap | undefined;
    };
    showDropIndicator?: {
        before?: boolean;
        after?: boolean;
        inside?: boolean;
    };
    className?: string;
    style?: CSSProperties;
}

export const SidebarParentItemView = forwardRef<
    HTMLDivElement,
    SidebarParentItemViewProps
>(
    (
        {
            parent,
            parentIndex,
            children,
            dragHandleProps,
            showDropIndicator = {},
            className = "",
            style,
        },
        ref
    ) => {
        return (
            <div className="relative mb-2">
                {/* ドロップインジケーター - 前 */}
                <div className="absolute -top-1 right-0 left-0 z-10">
                    <DropIndicator
                        position="before"
                        isVisible={showDropIndicator.before || false}
                    />
                </div>

                <div
                    ref={ref}
                    style={style}
                    data-testid="sidebar-parent-item"
                    className={`relative rounded border border-gray-300 bg-gray-50 p-1 ${className}`}
                >
                    {/* ドロップインジケーター - 内部 */}
                    <DropIndicator
                        position="inside"
                        isVisible={showDropIndicator.inside || false}
                    />

                    <div className="flex items-center gap-2">
                        <DragHandle
                            data-testid="sidebar-parent-drag-handle"
                            attributes={dragHandleProps?.attributes}
                            listeners={dragHandleProps?.listeners}
                        />
                        <strong>
                            [{parentIndex}] {parent.parentKey}
                        </strong>
                    </div>
                    <div
                        data-testid="sidebar-children-container"
                        className="mt-1 ml-5 flex flex-col gap-1 rounded border border-gray-300 bg-white p-1 text-xs text-gray-600"
                    >
                        {children}
                    </div>
                </div>

                {/* ドロップインジケーター - 後 */}
                <div className="absolute right-0 -bottom-1 left-0 z-10">
                    <DropIndicator
                        position="after"
                        isVisible={showDropIndicator.after || false}
                    />
                </div>
            </div>
        );
    }
);

SidebarParentItemView.displayName = "SidebarParentItemView";
