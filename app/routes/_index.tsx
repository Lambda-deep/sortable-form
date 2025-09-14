import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortableForm } from "../hooks/useSortableForm";
import { ParentItem } from "../components/ParentItem";
import { SidebarParentItem } from "../components/SidebarParentItem";
import { DragOverlayParentItem } from "../components/DragOverlayParentItem";
import { DragOverlaySidebarParentItem } from "../components/DragOverlaySidebarParentItem";
import { DragOverlayChildItem } from "../components/DragOverlayChildItem";
import { ClientOnly } from "../components/ClientOnly";
import Button from "../components/Button";
import type { Parent } from "../types";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

export default function Index() {
    const {
        register,
        handleSubmit,
        parentFields,
        watchedData,
        addParent,
        addChild,
        removeChild,
        removeParent,
        onSubmit,
        // ドラッグ関連
        formSensors,
        sidebarSensors,
        dragHandlers,
        dragState,
    } = useSortableForm();

    // Parent要素のIDリストを作成
    const parentIds = parentFields.map(field => field.id);
    const sidebarParentIds = parentFields.map(field => `sidebar-${field.id}`);

    console.log("🔍 Debug Info:", {
        parentIds,
        sidebarParentIds,
        parentFieldsLength: parentFields.length,
        sidebarParentIdsValues: sidebarParentIds.map(
            (id, index) => `[${index}]: ${id}`
        ),
    });

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
            <div
                data-testid="container"
                className="mx-auto grid max-w-6xl grid-cols-[1fr_300px] gap-5"
            >
                {/* フォーム側のDndContext */}
                <DndContext
                    sensors={formSensors}
                    modifiers={[restrictToVerticalAxis]}
                    onDragStart={event => {
                        console.log(
                            "📝 フォームDndContext: ドラッグ開始",
                            event
                        );
                        dragHandlers.onDragStart(event);
                    }}
                    onDragOver={dragHandlers.onDragOver}
                    onDragEnd={event => {
                        console.log(
                            "📝 フォームDndContext: ドラッグ終了",
                            event
                        );
                        dragHandlers.onDragEnd(event);
                    }}
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

                {/* サイドバー側のDndContext */}
                <DndContext
                    sensors={sidebarSensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragStart={event => {
                        console.log(
                            "🎯 サイドバーDndContext: ドラッグ開始",
                            event
                        );
                        dragHandlers.onSidebarDragStart(event);
                    }}
                    onDragOver={dragHandlers.onDragOver}
                    onDragEnd={event => {
                        console.log(
                            "🎯 サイドバーDndContext: ドラッグ終了",
                            event
                        );
                        dragHandlers.onSidebarDragEnd(event);
                    }}
                >
                    <div
                        data-testid="sidebar"
                        className="h-fit rounded-lg bg-white p-5 shadow-sm"
                    >
                        <h3>Index Information</h3>
                        <SortableContext
                            items={sidebarParentIds}
                            strategy={verticalListSortingStrategy}
                        >
                            {(() => {
                                console.log(
                                    "🔍 SortableContext items:",
                                    sidebarParentIds
                                );
                                return null;
                            })()}
                            <ul
                                data-testid="index-list"
                                className="flex list-none flex-col gap-2 p-0"
                            >
                                {watchedData.parentArray.map(
                                    (parent: Parent, parentIndex: number) => (
                                        <SidebarParentItem
                                            key={
                                                parentFields[parentIndex]?.id
                                                    ? `sidebar-${parentFields[parentIndex].id}`
                                                    : parentIndex
                                            }
                                            parent={parent}
                                            parentIndex={parentIndex}
                                            parentId={
                                                parentFields[parentIndex]?.id
                                                    ? `sidebar-${parentFields[parentIndex].id}`
                                                    : `sidebar-parent-${parentIndex}`
                                            }
                                            dragState={dragState}
                                        />
                                    )
                                )}
                            </ul>
                        </SortableContext>

                        <DragOverlay>
                            {dragState.sidebarActiveId &&
                            dragState.sidebarDraggedItem?.type === "parent" &&
                            "parentKey" in dragState.sidebarDraggedItem.data ? (
                                <DragOverlaySidebarParentItem
                                    parent={dragState.sidebarDraggedItem.data}
                                    parentIndex={
                                        dragState.sidebarDraggedItem.parentIndex
                                    }
                                />
                            ) : null}
                        </DragOverlay>
                    </div>
                </DndContext>
            </div>
        </ClientOnly>
    );
}
