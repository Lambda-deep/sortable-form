import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
    } = useFieldArray({
        control,
        name: "parentArray",
    });

    const watchedData = watch();

    // サイドバー用のデータ状態
    const [sidebarData, setSidebarData] = useState<Data>(() => ({
        parentArray: [...initialData.parentArray],
    }));

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
    };
}
