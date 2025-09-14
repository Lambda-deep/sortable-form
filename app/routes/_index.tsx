import { useSortableForm } from "../hooks/useSortableForm";
import { ParentItem } from "../components/ParentItem";
import { SidebarParentItem } from "../components/SidebarParentItem";
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
                            className="ml-2"
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
