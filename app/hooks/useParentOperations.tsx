import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Active, Over } from "@dnd-kit/core";
import { Data } from "../types";

interface UseParentOperationsProps {
    form: UseFormReturn<Data>;
}

export const useParentOperations = ({ form }: UseParentOperationsProps) => {
    const { control } = form;

    const {
        fields: parentFields,
        append: appendParent,
        move,
        remove: removeParent,
    } = useFieldArray({
        control,
        name: "parentArray",
    });

    const handleParentMove = (active: Active, over: Over) => {
        const activeIndex = parentFields.findIndex(
            field => field.id === active.id
        );
        const overIndex = parentFields.findIndex(field => field.id === over.id);

        if (
            activeIndex !== -1 &&
            overIndex !== -1 &&
            activeIndex !== overIndex
        ) {
            // useFieldArrayのmove関数を使用して要素を移動
            move(activeIndex, overIndex);
        }
    };

    const addParent = () => {
        appendParent({
            parentKey: `parent${parentFields.length + 1}`,
            parentValue: `Parent ${parentFields.length + 1}`,
            childArray: [],
        });
    };

    return {
        parentFields,
        handleParentMove,
        addParent,
        removeParent,
        move,
    };
};
