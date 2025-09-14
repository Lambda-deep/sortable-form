import type { UseFormRegister } from "react-hook-form";

export type Data = {
    parentArray: Parent[];
};

export type Parent = {
    parentKey: string;
    parentValue: string;
    childArray: Child[];
};

export type Child = {
    childKey: string;
    childValue: string;
};

// Drag & Drop Types
export interface DragState {
    activeId: string | null;
    draggedItem: DraggedItem | null;
    dropIndicator: DropIndicator | null;
}

export interface DraggedItem {
    type: "parent" | "child";
    parentIndex: number;
    childIndex?: number;
    data: Parent | Child;
}

export interface DropIndicator {
    targetId: string;
    position: "before" | "after" | "inside";
}

// Component Props Types
export type ParentItemProps = {
    parentIndex: number;
    parentFieldId: string;
    register: UseFormRegister<Data>;
    removeParent: (index: number) => void;
    watchedData: Data;
    addChild: (parentIndex: number) => void;
    removeChild: (parentIndex: number, childIndex: number) => void;
    dragState: DragState;
};

export type ChildItemProps = {
    parentIndex: number;
    childIndex: number;
    register: UseFormRegister<Data>;
    removeChild: (parentIndex: number, childIndex: number) => void;
    dragState: DragState;
};

export type SidebarParentItemProps = {
    parent: Parent;
    parentIndex: number;
};

export type SidebarChildItemProps = {
    child: Child;
    parentIndex: number;
    childIndex: number;
};
