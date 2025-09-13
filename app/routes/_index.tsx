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
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="container">
                <div className="form-section">
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
                                className="add-button"
                                onClick={addParent}
                            >
                                Add Parent
                            </button>
                            <button
                                type="submit"
                                className="add-button"
                                style={{
                                    marginLeft: "10px",
                                    backgroundColor: "#28a745",
                                }}
                            >
                                Submit Form
                            </button>
                        </div>
                    </form>
                </div>

                <div className="sidebar">
                    <h3>Index Information</h3>
                    <SortableContext
                        items={parentFields.map((field) => field.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul className="index-list">
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

            <DragOverlay>
                {activeId ? (
                    <div className="drag-overlay">Dragging...</div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
