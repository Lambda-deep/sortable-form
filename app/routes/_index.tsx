import { DndContext, DragOverlay } from "@dnd-kit/core";
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
        activeId,
        dragSource,
        sensors,
        customCollisionDetection,
        handleDragStart,
        handleDragEnd,
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

    return (
        <DndContext
            id="sortable-form-dnd-context"
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div
                data-testid="container"
                className="max-w-6xl mx-auto grid grid-cols-[1fr_300px] gap-5"
            >
                <div
                    data-testid="form-section"
                    className="bg-white p-5 rounded-lg shadow-sm"
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
                                        />
                                    )
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: "20px" }}>
                            <button
                                type="button"
                                data-testid="add-parent-button"
                                className="bg-blue-600 text-white border-none px-3 py-2 rounded cursor-pointer hover:bg-blue-700"
                                onClick={addParent}
                            >
                                Add Parent
                            </button>
                            <button
                                type="submit"
                                data-testid="submit-button"
                                className="bg-green-600 text-white border-none px-3 py-2 rounded cursor-pointer hover:bg-green-700 ml-2"
                            >
                                Submit Form
                            </button>
                        </div>
                    </form>
                </div>

                <div
                    data-testid="sidebar"
                    className="bg-white p-5 rounded-lg shadow-sm h-fit"
                >
                    <h3>Index Information</h3>
                    {dragSource !== "form" && (
                        <SortableContext
                            id="sidebar-sortable-context"
                            items={parentFields.map((_, index) =>
                                getSidebarParentId(index)
                            )}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul
                                data-testid="index-list"
                                className="list-none p-0"
                            >
                                {watchedData.parentArray.map(
                                    (parent: Parent, parentIndex: number) => (
                                        <SidebarParentItem
                                            key={getSidebarParentId(
                                                parentIndex
                                            )}
                                            parentField={{
                                                ...parentFields[parentIndex],
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
                                        />
                                    )
                                )}
                            </ul>
                        </SortableContext>
                    )}
                    {dragSource === "form" && (
                        <ul data-testid="index-list" className="list-none p-0">
                            {watchedData.parentArray.map(
                                (parent: Parent, parentIndex: number) => (
                                    <SidebarParentItem
                                        key={getSidebarParentId(parentIndex)}
                                        parentField={{
                                            ...parentFields[parentIndex],
                                            id: getSidebarParentId(parentIndex),
                                        }}
                                        parent={parent}
                                        parentIndex={parentIndex}
                                        dragSource={dragSource}
                                        getSidebarChildId={getSidebarChildId}
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
