import { DndContext } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortableForm } from "../hooks/useSortableForm";
import { ParentItem } from "../components/ParentItem";
import { SidebarParentItem } from "../components/SidebarParentItem";
import type { Parent } from "../types";

export default function Index() {
    const {
        register,
        handleSubmit,
        parentFields,
        watchedData,
        sidebarData,
        dragSource,
        dragOverId,
        dragOverPosition,
        sensors,
        customCollisionDetection,
        handleDragStart,
        handleDragEnd,
        handleSidebarDragEnd,
        addParent,
        addChild,
        removeChild,
        removeParent,
        onSubmit,
        getParentId,
        getChildId,
        getSidebarParentId,
        getSidebarChildId,
    } = useSortableForm();

    // ドラッグソースに基づいて適切なハンドラーを選択
    const currentDragHandler =
        dragSource === "sidebar" ? handleSidebarDragEnd : handleDragEnd;

    return (
        <DndContext
            id="sortable-form-dnd-context"
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={currentDragHandler}
            autoScroll={true}
        >
            <div
                data-testid="container"
                className="mx-auto grid max-w-6xl grid-cols-[1fr_300px] gap-5"
                style={{ overflow: "visible" }} // ドラッグ要素が範囲外にも表示できるように
            >
                <div
                    data-testid="form-section"
                    className="rounded-lg bg-white p-5 shadow-sm"
                    style={{ overflow: "visible" }} // ドラッグ要素が範囲外にも表示できるように
                >
                    <h2>Sortable Form</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {dragSource !== "sidebar" && (
                            <SortableContext
                                id="form-sortable-context"
                                items={parentFields.map((_, index) =>
                                    getParentId(index)
                                )}
                                strategy={verticalListSortingStrategy}
                            >
                                {parentFields.map(
                                    (parentField, parentIndex) => (
                                        <ParentItem
                                            key={getParentId(parentIndex)}
                                            parentField={{
                                                ...parentField,
                                                id: getParentId(parentIndex),
                                            }}
                                            parentIndex={parentIndex}
                                            register={register}
                                            removeParent={removeParent}
                                            watchedData={watchedData}
                                            addChild={addChild}
                                            removeChild={removeChild}
                                            dragSource={dragSource}
                                            getChildId={getChildId}
                                            dragOverId={dragOverId}
                                            dragOverPosition={dragOverPosition}
                                        />
                                    )
                                )}
                            </SortableContext>
                        )}
                        {dragSource === "sidebar" && (
                            <div>
                                {parentFields.map(
                                    (parentField, parentIndex) => (
                                        <ParentItem
                                            key={getParentId(parentIndex)}
                                            parentField={{
                                                ...parentField,
                                                id: getParentId(parentIndex),
                                            }}
                                            parentIndex={parentIndex}
                                            register={register}
                                            removeParent={removeParent}
                                            watchedData={watchedData}
                                            addChild={addChild}
                                            removeChild={removeChild}
                                            dragSource={dragSource}
                                            getChildId={getChildId}
                                            dragOverId={dragOverId}
                                            dragOverPosition={dragOverPosition}
                                        />
                                    )
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: "20px" }}>
                            <button
                                type="button"
                                data-testid="add-parent-button"
                                className="cursor-pointer rounded border-none bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                                onClick={addParent}
                            >
                                Add Parent
                            </button>
                            <button
                                type="submit"
                                data-testid="submit-button"
                                className="ml-2 cursor-pointer rounded border-none bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                            >
                                Submit Form
                            </button>
                        </div>
                    </form>
                </div>

                <div
                    data-testid="sidebar"
                    className="h-fit rounded-lg bg-white p-5 shadow-sm"
                    style={{ overflow: "visible" }} // ドラッグ要素が範囲外にも表示できるように
                >
                    <h3>Index Information</h3>
                    {dragSource !== "form" && (
                        <SortableContext
                            id="sidebar-sortable-context"
                            items={sidebarData.parentArray.map((_, index) =>
                                getSidebarParentId(index)
                            )}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul
                                data-testid="index-list"
                                className="list-none p-0"
                            >
                                {sidebarData.parentArray.map(
                                    (parent: Parent, parentIndex: number) => (
                                        <SidebarParentItem
                                            key={getSidebarParentId(
                                                parentIndex
                                            )}
                                            parentField={{
                                                id: getSidebarParentId(
                                                    parentIndex
                                                ),
                                            }}
                                            parent={parent}
                                            parentIndex={parentIndex}
                                            dragSource={dragSource}
                                            getSidebarChildId={
                                                getSidebarChildId
                                            }
                                            dragOverId={dragOverId}
                                            dragOverPosition={dragOverPosition}
                                        />
                                    )
                                )}
                            </ul>
                        </SortableContext>
                    )}
                    {dragSource === "form" && (
                        <ul data-testid="index-list" className="list-none p-0">
                            {sidebarData.parentArray.map(
                                (parent: Parent, parentIndex: number) => (
                                    <SidebarParentItem
                                        key={getSidebarParentId(parentIndex)}
                                        parentField={{
                                            id: getSidebarParentId(parentIndex),
                                        }}
                                        parent={parent}
                                        parentIndex={parentIndex}
                                        dragSource={dragSource}
                                        getSidebarChildId={getSidebarChildId}
                                        dragOverId={dragOverId}
                                        dragOverPosition={dragOverPosition}
                                    />
                                )
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </DndContext>
    );
}
