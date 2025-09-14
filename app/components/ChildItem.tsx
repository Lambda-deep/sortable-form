import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ChildItemProps } from "../types";

export function ChildItem({
    id,
    parentIndex,
    childIndex,
    register,
    removeChild,
}: ChildItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging, isOver } =
        useSortable({
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
    };

    return (
        <>
            {/* 子要素のドロップインジケーター：isOverがtrueかつ自分がドラッグ中でない場合のみ表示 */}
            {isOver && !isDragging && (
                <div
                    style={{
                        height: "3px",
                        backgroundColor: "#007bff",
                        marginBottom: "4px",
                        borderRadius: "1px",
                    }}
                />
            )}
            <div
                ref={setNodeRef}
                style={style}
                data-testid="child-item"
                data-sortable-id={id}
                data-drag-source="form"
                className="mb-2 flex cursor-grab items-center gap-2 rounded border border-gray-300 bg-gray-50 p-2"
            >
                <span
                    data-testid="drag-handle"
                    className="flex h-4 w-4 cursor-grab items-center justify-center text-lg text-gray-600"
                    {...attributes}
                    {...listeners}
                >
                    ⋮
                </span>
                <input
                    {...register(
                        `parentArray.${parentIndex}.childArray.${childIndex}.childKey`
                    )}
                    className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                    placeholder="Child Key"
                />
                <input
                    {...register(
                        `parentArray.${parentIndex}.childArray.${childIndex}.childValue`
                    )}
                    className="flex-1 rounded-sm border border-gray-400 px-1 py-1"
                    placeholder="Child Value"
                />
                <button
                    type="button"
                    className="cursor-pointer rounded-sm border-none bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                    onClick={() => removeChild(parentIndex, childIndex)}
                >
                    ×
                </button>
            </div>
        </>
    );
}
