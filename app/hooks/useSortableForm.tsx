import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Sortable from "sortablejs";
import type { Data, Child } from "../types";

const initialData: Data = {
    parentArray: [
        {
            parentKey: "parent1",
            parentValue: "Parent 1",
            childArray: [
                { childKey: "child1-1", childValue: "Child 1-1" },
                { childKey: "child1-2", childValue: "Child 1-2" },
            ],
        },
        {
            parentKey: "parent2",
            parentValue: "Parent 2",
            childArray: [{ childKey: "child2-1", childValue: "Child 2-1" }],
        },
    ],
};

export function useSortableForm() {
    const { control, register, watch, setValue, getValues, handleSubmit } =
        useForm<Data>({
            defaultValues: initialData,
        });

    const {
        fields: parentFields,
        append: appendParent,
        remove: removeParent,
        move: moveParent,
    } = useFieldArray({
        control,
        name: "parentArray",
    });

    const watchedData = watch();

    // サイドバー用のデータ状態
    const [sidebarData, setSidebarData] = useState<Data>(() => ({
        parentArray: [...initialData.parentArray],
    }));

    // SortableJS インスタンスへの参照
    const parentSortableRef = useRef<Sortable | null>(null);
    const sidebarParentSortableRef = useRef<Sortable | null>(null);
    const childSortableRefs = useRef<{ [key: number]: Sortable }>({});
    const sidebarChildSortableRefs = useRef<{ [key: number]: Sortable }>({});

    // 共通のSortableJS設定
    const commonSortableConfig = {
        animation: 150,
        ghostClass: "sortable-ghost",
        chosenClass: "sortable-chosen",
        forceFallback: true,
        fallbackOnBody: true,
        swapThreshold: 0.65,
    };

    // 親要素の順序を更新する関数
    const updateParentOrder = useCallback((oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return;
        moveParent(oldIndex, newIndex);
    }, [moveParent]);

    // 子要素の順序を更新する関数
    const updateChildOrder = useCallback((parentIndex: number, oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex) return;
        
        const currentParent = getValues(`parentArray.${parentIndex}`);
        const newChildArray = [...currentParent.childArray];
        const [movedChild] = newChildArray.splice(oldIndex, 1);
        newChildArray.splice(newIndex, 0, movedChild);
        
        setValue(`parentArray.${parentIndex}.childArray`, newChildArray);
    }, [getValues, setValue]);

    // 子要素を親間で移動する関数
    const moveChildBetweenParents = useCallback((
        fromParentIndex: number,
        toParentIndex: number,
        fromChildIndex: number,
        toChildIndex: number
    ) => {
        const fromParent = getValues(`parentArray.${fromParentIndex}`);
        const toParent = getValues(`parentArray.${toParentIndex}`);
        
        const newFromChildArray = [...fromParent.childArray];
        const newToChildArray = [...toParent.childArray];
        
        const [movedChild] = newFromChildArray.splice(fromChildIndex, 1);
        newToChildArray.splice(toChildIndex, 0, movedChild);
        
        setValue(`parentArray.${fromParentIndex}.childArray`, newFromChildArray);
        setValue(`parentArray.${toParentIndex}.childArray`, newToChildArray);
    }, [getValues, setValue]);

    // フォームデータとサイドバーデータの同期（JSON比較で無限ループを防ぐ）
    useEffect(() => {
        const newSidebarData = {
            parentArray: [...watchedData.parentArray],
        };

        // JSON文字列の比較で変更を検出
        if (JSON.stringify(sidebarData) !== JSON.stringify(newSidebarData)) {
            setSidebarData(newSidebarData);
        }
    }, [watchedData.parentArray, sidebarData]);

    const addParent = () => {
        appendParent({
            parentKey: `parent${parentFields.length + 1}`,
            parentValue: `Parent ${parentFields.length + 1}`,
            childArray: [],
        });
    };

    const addChild = (parentIndex: number) => {
        const currentParent = getValues(`parentArray.${parentIndex}`);
        const newChild: Child = {
            childKey: `child${parentIndex}-${currentParent.childArray.length + 1}`,
            childValue: `Child ${parentIndex}-${currentParent.childArray.length + 1}`,
        };
        setValue(`parentArray.${parentIndex}.childArray`, [
            ...currentParent.childArray,
            newChild,
        ]);
    };

    const removeChild = (parentIndex: number, childIndex: number) => {
        const currentParent = getValues(`parentArray.${parentIndex}`);
        const newChildArray = currentParent.childArray.filter(
            (_, index) => index !== childIndex
        );
        setValue(`parentArray.${parentIndex}.childArray`, newChildArray);
    };

    const onSubmit = (data: Data) => {
        console.log("Submitted data:", data);
        window.alert("Form submitted! Check console for data.");
    };

    return {
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
        // SortableJS関連の関数をエクスポート
        updateParentOrder,
        updateChildOrder,
        moveChildBetweenParents,
        commonSortableConfig,
        // Sortableインスタンスの参照
        parentSortableRef,
        sidebarParentSortableRef,
        childSortableRefs,
        sidebarChildSortableRefs,
    };
}
