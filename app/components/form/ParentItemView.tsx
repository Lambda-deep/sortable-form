import { forwardRef, type ReactNode, type CSSProperties } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { Parent } from "../../types";
import Button from "../ui/Button";
import DragHandle from "../ui/DragHandle";
import { DropIndicator } from "../ui/DropIndicator";

interface ParentItemViewProps {
    parent?: Parent;
    children?: ReactNode;
    dragHandleProps?: {
        attributes: DraggableAttributes;
        listeners: SyntheticListenerMap | undefined;
    };
    onRemove?: () => void;
    onAddChild?: () => void;
    showDropIndicator?: {
        before?: boolean;
        after?: boolean;
        inside?: boolean;
    };
    className?: string;
    style?: CSSProperties;
    registerParentKey?: Record<string, unknown>;
    registerParentValue?: Record<string, unknown>;
    childrenContainerRef?: (node: HTMLDivElement | null) => void;
}

export const ParentItemView = forwardRef<HTMLDivElement, ParentItemViewProps>(
    (
        {
            parent,
            children,
            dragHandleProps,
            onRemove,
            onAddChild,
            showDropIndicator = {},
            className = "",
            style,
            registerParentKey = {},
            registerParentValue = {},
            childrenContainerRef,
        },
        ref
    ) => {
        return (
            <div className="relative mb-4">
                {/* ドロップインジケーター - 前 */}
                <div className="absolute -top-2 right-0 left-0 z-10">
                    <DropIndicator
                        position="before"
                        isVisible={showDropIndicator.before || false}
                    />
                </div>

                <div
                    ref={ref}
                    style={style}
                    data-testid="parent-item"
                    className={`relative rounded border border-gray-300 bg-gray-50 p-4 ${className}`}
                >
                    {/* ドロップインジケーター - 内部 */}
                    <DropIndicator
                        position="inside"
                        isVisible={showDropIndicator.inside || false}
                    />

                    <div className="flex items-center gap-2">
                        <DragHandle
                            data-testid="parent-drag-handle"
                            attributes={dragHandleProps?.attributes}
                            listeners={dragHandleProps?.listeners}
                        />
                        <input
                            {...registerParentKey}
                            value={parent?.parentKey}
                            className="flex-1 rounded border border-gray-400 px-2 py-1"
                            placeholder="Parent Key"
                        />
                        <input
                            {...registerParentValue}
                            value={parent?.parentValue}
                            className="flex-1 rounded border border-gray-400 px-2 py-1"
                            placeholder="Parent Value"
                        />
                        <Button
                            type="button"
                            variant="remove"
                            size="sm"
                            onClick={onRemove}
                        >
                            Remove
                        </Button>
                    </div>

                    <div
                        ref={childrenContainerRef}
                        data-testid="children-container"
                        className="mt-2 flex flex-col rounded border border-gray-300 bg-white p-2"
                    >
                        {children}
                    </div>

                    <Button
                        type="button"
                        variant="add"
                        size="sm"
                        className="mt-2"
                        onClick={onAddChild}
                    >
                        Add Child
                    </Button>
                </div>

                {/* ドロップインジケーター - 後 */}
                <div className="absolute right-0 -bottom-2 left-0 z-10">
                    <DropIndicator
                        position="after"
                        isVisible={showDropIndicator.after || false}
                    />
                </div>
            </div>
        );
    }
);

ParentItemView.displayName = "ParentItemView";
