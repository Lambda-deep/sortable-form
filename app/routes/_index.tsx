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
        addParent,
        addChild,
        removeChild,
        removeParent,
        onSubmit,
    } = useSortableForm();

    return (
        <div
            data-testid="container"
            className="mx-auto grid max-w-6xl grid-cols-[1fr_300px] gap-5"
        >
            <div
                data-testid="form-section"
                className="rounded-lg bg-white p-5 shadow-sm"
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    {parentFields.map((parentField, parentIndex) => (
                        <ParentItem
                            key={parentField.id}
                            parentIndex={parentIndex}
                            register={register}
                            removeParent={removeParent}
                            watchedData={watchedData}
                            addChild={addChild}
                            removeChild={removeChild}
                        />
                    ))}

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
            >
                <h3>Index Information</h3>
                <ul data-testid="index-list" className="list-none p-0">
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
    );
}
