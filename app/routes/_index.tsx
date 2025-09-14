import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortableForm } from "../hooks/useSortableForm";
import { ParentItem } from "../components/ParentItem";
import { SidebarParentItem } from "../components/SidebarParentItem";
import { DragOverlayParentItem } from "../components/DragOverlayParentItem";
import { DragOverlayChildItem } from "../components/DragOverlayChildItem";
import { ClientOnly } from "../components/ClientOnly";
import Button from "../components/Button";
import type { Parent } from "../types";

export default function Index() {
    const {
        register,
        handleSubmit,
        parentFields,
        watchedData,
        sidebarData,
        addParent,
        addChild,
        removeChild,
        removeParent,
        onSubmit,
        // ドラッグ関連
        sensors,
        dragHandlers,
        dragState,
    } = useSortableForm();

    // Parent要素のIDリストを作成
    const parentIds = parentFields.map(field => field.id);

    return (
        <ClientOnly
            fallback={
                <div className="mx-auto grid max-w-6xl grid-cols-[1fr_300px] gap-5">
                    <div className="rounded-lg bg-white p-5 shadow-sm">
                        <p>Loading...</p>
                    </div>
                    <div className="h-fit rounded-lg bg-white p-5 shadow-sm">
                        <p>Loading...</p>
                    </div>
                </div>
            }
        >
            <DndContext
                sensors={sensors}
                onDragStart={dragHandlers.onDragStart}
                onDragOver={dragHandlers.onDragOver}
                onDragEnd={dragHandlers.onDragEnd}
            >
                <div
                    data-testid="container"
                    className="mx-auto grid max-w-6xl grid-cols-[1fr_300px] gap-5"
                >
                    <div
                        data-testid="form-section"
                        className="rounded-lg bg-white p-5 shadow-sm"
                    >
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <SortableContext
                                items={parentIds}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex flex-col gap-4">
                                    {parentFields.map(
                                        (parentField, parentIndex) => (
                                            <ParentItem
                                                key={parentField.id}
                                                parentIndex={parentIndex}
                                                parentFieldId={parentField.id}
                                                register={register}
                                                removeParent={removeParent}
                                                watchedData={watchedData}
                                                addChild={addChild}
                                                removeChild={removeChild}
                                                dragState={dragState}
                                            />
                                        )
                                    )}
                                </div>
                            </SortableContext>

                            <div className="mt-5 flex gap-2">
                                <Button
                                    type="button"
                                    variant="add"
                                    data-testid="add-parent-button"
                                    onClick={addParent}
                                >
                                    Add Parent
                                </Button>
                                <Button
                                    type="submit"
                                    variant="submit"
                                    data-testid="submit-button"
                                >
                                    Submit Form
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div
                        data-testid="sidebar"
                        className="h-fit rounded-lg bg-white p-5 shadow-sm"
                    >
                        <h3>Index Information</h3>
                        <ul
                            data-testid="index-list"
                            className="flex list-none flex-col gap-2 p-0"
                        >
                            {sidebarData.parentArray.map(
                                (parent: Parent, parentIndex: number) => (
                                    <SidebarParentItem
                                        key={parentIndex}
                                        parent={parent}
                                        parentIndex={parentIndex}
                                    />
                                )
                            )}
                        </ul>
                    </div>
                </div>

                <DragOverlay>
                    {dragState.activeId &&
                    dragState.draggedItem?.type === "parent" &&
                    "parentKey" in dragState.draggedItem.data ? (
                        <DragOverlayParentItem
                            parent={dragState.draggedItem.data}
                            parentIndex={dragState.draggedItem.parentIndex}
                        />
                    ) : dragState.activeId &&
                      dragState.draggedItem?.type === "child" &&
                      "childKey" in dragState.draggedItem.data ? (
                        <DragOverlayChildItem
                            child={dragState.draggedItem.data}
                        />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </ClientOnly>
    );
}
