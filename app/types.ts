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

// Component Props Types
export type ParentItemProps = {
    parentField: any;
    parentIndex: number;
    register: any;
    removeParent: (index: number) => void;
    watchedData: Data;
    addChild: (parentIndex: number) => void;
    removeChild: (parentIndex: number, childIndex: number) => void;
    dragSource: "form" | "sidebar" | null;
    getChildId?: (parentIndex: number, childIndex: number) => string;
};

export type ChildItemProps = {
    id: string;
    child: Child;
    parentIndex: number;
    childIndex: number;
    register: any;
    removeChild: (parentIndex: number, childIndex: number) => void;
    dragSource: "form" | "sidebar" | null;
};

export type SidebarParentItemProps = {
    parentField: any;
    parent: Parent;
    parentIndex: number;
    dragSource: "form" | "sidebar" | null;
    getSidebarChildId?: (parentIndex: number, childIndex: number) => string;
};

export type SidebarChildItemProps = {
    id: string;
    child: Child;
    parentIndex: number;
    childIndex: number;
    dragSource: "form" | "sidebar" | null;
};
