import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ParentItemProps } from "../types";
import { ChildItem } from "./ChildItem";
import { DropIndicator } from "./DropIndicator";
import Button from "./Button";
import DragHandle from "./DragHandle";

export function ParentItem({
    parentIndex,
    parentFieldId,
    register,
    removeParent,
    watchedData,
    addChild,
    removeChild,
    dragState,
}: ParentItemProps) {
    const currentParent = watchedData.parentArray[parentIndex];

    // useFieldArrayからの実際のIDを使用
    const parentId = parentFieldId;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isSorting, // 追加：ソート中かどうかを判定
    } = useSortable({ id: parentId });

    // ドロップインジケーターの表示判定
    const showDropIndicator = dragState.dropIndicator?.targetId === parentId;
    const dropPosition = dragState.dropIndicator?.position || "before";

    // 元の場所の空白表示（ドラッグされている要素の場合）
    const isBeingDragged = dragState.activeId === parentId;

    const style = {
        // isSortingがtrueの場合はtransformを無効化して元の位置に留める
        transform: isSorting ? undefined : CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    console.log(isDragging, isSorting);

    return (
        <div className="relative">
            {/* ドロップインジケーター - 前 */}
            <DropIndicator
                position="before"
                isVisible={showDropIndicator && dropPosition === "before"}
            />

            <div
                ref={setNodeRef}
                style={style}
                data-testid="parent-item"
                className={`relative rounded border border-gray-300 bg-gray-50 p-4 ${isDragging ? "z-50 shadow-2xl" : "shadow-sm"} ${isBeingDragged && !isDragging ? "border-dashed opacity-0" : ""}`}
            >
                {/* ドロップインジケーター - 内部 */}
                <DropIndicator
                    position="inside"
                    isVisible={showDropIndicator && dropPosition === "inside"}
                />

                <div className="flex items-center gap-2">
                    <DragHandle
                        data-testid="parent-drag-handle"
                        attributes={attributes}
                        listeners={listeners}
                    />
                    <input
                        {...register(`parentArray.${parentIndex}.parentKey`)}
                        className="flex-1 rounded border border-gray-400 px-2 py-1"
                        placeholder="Parent Key"
                    />
                    <input
                        {...register(`parentArray.${parentIndex}.parentValue`)}
                        className="flex-1 rounded border border-gray-400 px-2 py-1"
                        placeholder="Parent Value"
                    />
                    <Button
                        type="button"
                        variant="remove"
                        size="sm"
                        onClick={() => removeParent(parentIndex)}
                    >
                        Remove
                    </Button>
                </div>

                <div
                    data-testid="children-container"
                    className="mt-2 flex flex-col gap-2 rounded border border-gray-300 bg-white p-2"
                >
                    {currentParent?.childArray?.map((_, childIndex: number) => (
                        <ChildItem
                            key={childIndex}
                            parentIndex={parentIndex}
                            childIndex={childIndex}
                            register={register}
                            removeChild={removeChild}
                        />
                    ))}
                </div>
                <Button
                    type="button"
                    variant="add"
                    size="sm"
                    className="mt-2"
                    onClick={() => addChild(parentIndex)}
                >
                    Add Child
                </Button>
            </div>

            {/* ドロップインジケーター - 後 */}
            <DropIndicator
                position="after"
                isVisible={showDropIndicator && dropPosition === "after"}
            />
        </div>
    );
}
