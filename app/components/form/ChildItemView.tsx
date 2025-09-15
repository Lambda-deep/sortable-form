import { forwardRef, type CSSProperties } from "react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { Child, ShowDropIndicator } from "../../types";
import Button from "../ui/Button";
import DragHandle from "../ui/DragHandle";
import { DropIndicator } from "../ui/DropIndicator";

interface ChildItemViewProps {
    child?: Child;
    dragHandleProps?: {
        attributes: DraggableAttributes;
        listeners: SyntheticListenerMap | undefined;
    };
    onRemove?: () => void;
    showDropIndicator?: ShowDropIndicator;
    className?: string;
    style?: CSSProperties;
    registerChildKey?: Record<string, unknown>;
    registerChildValue?: Record<string, unknown>;
}

export const ChildItemView = forwardRef<HTMLDivElement, ChildItemViewProps>(
    (
        {
            child,
            dragHandleProps,
            onRemove = () => {},
            showDropIndicator = {},
            className = "",
            style,
            registerChildKey = {},
            registerChildValue = {},
        },
        ref
    ) => {
        const isReadOnly = Boolean(child);
        return (
            <div className="relative">
                {/* ドロップインジケーター - 前 */}
                <div className="absolute -top-1 right-0 left-0 z-10">
                    <DropIndicator
                        position="before"
                        isVisible={showDropIndicator === "before"}
                    />
                </div>

                <div
                    ref={ref}
                    style={style}
                    data-testid="child-item"
                    className={`flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 ${className}`}
                >
                    <DragHandle
                        data-testid="child-drag-handle"
                        attributes={dragHandleProps?.attributes}
                        listeners={dragHandleProps?.listeners}
                    />
                    <input
                        {...registerChildKey}
                        value={child?.childKey}
                        readOnly={isReadOnly}
                        className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                        placeholder="Child Key"
                    />
                    <input
                        {...registerChildValue}
                        value={child?.childValue}
                        readOnly={isReadOnly}
                        className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                        placeholder="Child Value"
                    />
                    <Button
                        type="button"
                        variant="remove"
                        size="sm"
                        onClick={onRemove}
                    >
                        ×
                    </Button>
                </div>

                {/* ドロップインジケーター - 後 */}
                <div className="absolute right-0 -bottom-1 left-0 z-10">
                    <DropIndicator
                        position="after"
                        isVisible={showDropIndicator === "after"}
                    />
                </div>
            </div>
        );
    }
);

ChildItemView.displayName = "ChildItemView";
