import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChildItemProps } from "../types";
import { DropIndicator } from "./DropIndicator";
import Button from "./Button";
import DragHandle from "./DragHandle";

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
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div className="relative mb-2">
            {/* ドロップインジケーター - 前 */}
            <div className="absolute -top-1 right-0 left-0 z-10">
                <DropIndicator
                    position="before"
                    isVisible={showDropIndicator && dropPosition === "before"}
                />
            </div>

            <div
                ref={setNodeRef}
                style={style}
                data-testid="child-item"
                className={`flex items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2 ${isDragging ? "z-50 shadow-2xl" : "shadow-sm"}`}
            >
                <DragHandle
                    data-testid="child-drag-handle"
                    attributes={attributes}
                    listeners={listeners}
                />
                <input
                    {...register(
                        `parentArray.${parentIndex}.childArray.${childIndex}.childKey` as const
                    )}
                    className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                    placeholder="Child Key"
                />
                <input
                    {...register(
                        `parentArray.${parentIndex}.childArray.${childIndex}.childValue` as const
                    )}
                    className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                    placeholder="Child Value"
                />
                <Button
                    type="button"
                    variant="remove"
                    size="sm"
                    onClick={() => removeChild(parentIndex, childIndex)}
                >
                    ×
                </Button>
            </div>

            {/* ドロップインジケーター - 後 */}
            <div className="absolute right-0 -bottom-1 left-0 z-10">
                <DropIndicator
                    position="after"
                    isVisible={showDropIndicator && dropPosition === "after"}
                />
            </div>
        </div>
    );
}
