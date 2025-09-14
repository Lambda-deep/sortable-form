import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChildItemProps } from "../types";

export function ChildItem({
    id,
    child,
    parentIndex,
    childIndex,
    register,
    removeChild,
    dragSource,
}: ChildItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({
        id,
        animateLayoutChanges: () => false, // アニメーションを無効にしてスナップを防ぐ
        disabled: false, // ドラッグを有効化
        transition: null, // トランジションを完全に無効化
    });

    const style = {
        // ドラッグ中はカーソルに追従させる
        transform: CSS.Transform.toString(transform),
        transition: "none", // 常にトランジションを無効
        // ドラッグ中は要素を見えるようにし、zIndexで前面に表示
        ...(isDragging && {
            zIndex: 1000,
            opacity: 0.9,
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }),
        // ドロップインジケーター（ドラッグ中は表示しない）
        ...(isOver &&
            !isDragging && {
                borderTop: "3px solid #007bff",
                marginTop: "4px",
            }),
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                data-testid="child-item"
                data-sortable-id={id}
                data-drag-source="form"
                className="flex gap-2 items-center p-2 mb-2 bg-gray-50 border border-gray-300 rounded cursor-grab"
            >
                <span
                    data-testid="drag-handle"
                    className="cursor-grab text-gray-600 text-lg"
                    {...attributes}
                    {...listeners}
                >
                    ⋮
                </span>
                <input
                    {...register(
                        `parentArray.${parentIndex}.childArray.${childIndex}.childKey`
                    )}
                    className="flex-1 px-1 py-1 border border-gray-400 rounded-sm"
                    placeholder="Child Key"
                />
                <input
                    {...register(
                        `parentArray.${parentIndex}.childArray.${childIndex}.childValue`
                    )}
                    className="flex-1 px-1 py-1 border border-gray-400 rounded-sm"
                    placeholder="Child Value"
                />
                <button
                    type="button"
                    className="bg-red-600 text-white border-none px-2 py-1 rounded-sm cursor-pointer text-xs hover:bg-red-700"
                    onClick={() => removeChild(parentIndex, childIndex)}
                >
                    ×
                </button>
            </div>
        </>
    );
}
