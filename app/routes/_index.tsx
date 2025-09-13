import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortableForm } from "../hooks/useSortableForm";
import { SortableParentItem } from "../components/SortableParentItem";
import { SortableSidebarParentItem } from "../components/SortableSidebarParentItem";
import type { Parent } from "../types";

export default function Index() {
    const {
        register,
        handleSubmit,
        parentFields,
        watchedData,
        activeId,
        sensors,
        customCollisionDetection,
        handleDragStart,
        handleDragEnd,
        addParent,
        addChild,
        removeChild,
        removeParent,
        onSubmit,
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
                        <SortableContext
                            items={parentFields.map((field) => field.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {parentFields.map((parentField, parentIndex) => (
                                <SortableParentItem
                                    key={parentField.id}
                                    parentField={parentField}
                                    parentIndex={parentIndex}
                                    register={register}
                                    removeParent={removeParent}
                                    watchedData={watchedData}
                                    addChild={addChild}
                                    removeChild={removeChild}
                                />
                            ))}
                        </SortableContext>

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
                    <SortableContext
                        items={parentFields.map((field) => field.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul data-testid="index-list" className="list-none p-0">
                            {watchedData.parentArray.map(
                                (parent: Parent, parentIndex: number) => (
                                    <SortableSidebarParentItem
                                        key={
                                            parentFields[parentIndex]?.id ||
                                            parentIndex
                                        }
                                        parentField={parentFields[parentIndex]}
                                        parent={parent}
                                        parentIndex={parentIndex}
                                    />
                                )
                            )}
                        </ul>
                    </SortableContext>
                </div>
            </div>
        </DndContext>
    );
}
