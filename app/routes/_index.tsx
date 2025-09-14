import { useEffect, useRef } from "react";
import Sortable from "sortablejs";
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
        // SortableJS関連
        updateParentOrder,
        updateChildOrder,
        moveChildBetweenParents,
        commonSortableConfig,
        parentSortableRef,
        sidebarParentSortableRef,
        childSortableRefs,
        sidebarChildSortableRefs,
    } = useSortableForm();

    // フォーム親要素コンテナの参照
    const formParentContainerRef = useRef<HTMLDivElement>(null);
    // サイドバー親要素コンテナの参照  
    const sidebarParentContainerRef = useRef<HTMLUListElement>(null);

    // フォーム側の親要素ソート設定
    useEffect(() => {
        // Only run on client side to avoid hydration issues
        if (typeof window === 'undefined') return;
        if (!formParentContainerRef.current) return;

        // 既存のインスタンスをクリーンアップ
        if (parentSortableRef.current) {
            parentSortableRef.current.destroy();
        }

        const parentSortableConfig = {
            ...commonSortableConfig,
            group: "parents",
            onEnd: (evt: any) => {
                updateParentOrder(evt.oldIndex, evt.newIndex);
            },
        };

        parentSortableRef.current = Sortable.create(formParentContainerRef.current, parentSortableConfig);

        return () => {
            if (parentSortableRef.current) {
                parentSortableRef.current.destroy();
                parentSortableRef.current = null;
            }
        };
    }, [updateParentOrder, commonSortableConfig, parentSortableRef]);

    // サイドバー側の親要素ソート設定
    useEffect(() => {
        // Only run on client side to avoid hydration issues
        if (typeof window === 'undefined') return;
        if (!sidebarParentContainerRef.current) return;

        // 既存のインスタンスをクリーンアップ
        if (sidebarParentSortableRef.current) {
            sidebarParentSortableRef.current.destroy();
        }

        const sidebarParentSortableConfig = {
            ...commonSortableConfig,
            group: "parents", // フォームと同じグループ名
            onEnd: (evt: any) => {
                updateParentOrder(evt.oldIndex, evt.newIndex);
            },
        };

        sidebarParentSortableRef.current = Sortable.create(sidebarParentContainerRef.current, sidebarParentSortableConfig);

        return () => {
            if (sidebarParentSortableRef.current) {
                sidebarParentSortableRef.current.destroy();
                sidebarParentSortableRef.current = null;
            }
        };
    }, [updateParentOrder, commonSortableConfig, sidebarParentSortableRef]);

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
                    <div 
                        ref={formParentContainerRef}
                        className="flex flex-col gap-4"
                    >
                        {parentFields.map((parentField, parentIndex) => (
                            <ParentItem
                                key={parentField.id}
                                parentIndex={parentIndex}
                                register={register}
                                removeParent={removeParent}
                                watchedData={watchedData}
                                addChild={addChild}
                                removeChild={removeChild}
                                updateParentOrder={updateParentOrder}
                                updateChildOrder={updateChildOrder}
                                moveChildBetweenParents={moveChildBetweenParents}
                                commonSortableConfig={commonSortableConfig}
                                childSortableRefs={childSortableRefs}
                            />
                        ))}
                    </div>

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
                    ref={sidebarParentContainerRef}
                    data-testid="index-list"
                    className="flex list-none flex-col gap-2 p-0"
                >
                    {sidebarData.parentArray.map(
                        (parent: Parent, parentIndex: number) => (
                            <SidebarParentItem
                                key={`${parentIndex}-${parent.parentKey}`}
                                parent={parent}
                                parentIndex={parentIndex}
                                updateChildOrder={updateChildOrder}
                                moveChildBetweenParents={moveChildBetweenParents}
                                commonSortableConfig={commonSortableConfig}
                                sidebarChildSortableRefs={sidebarChildSortableRefs}
                            />
                        )
                    )}
                </ul>
            </div>
        </div>
    );
}
