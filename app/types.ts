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
export type SortableParentItemProps = {
    parentField: any;
    parentIndex: number;
    register: any;
    removeParent: (index: number) => void;
    watchedData: Data;
    addChild: (parentIndex: number) => void;
    removeChild: (parentIndex: number, childIndex: number) => void;
};

export type SortableChildItemProps = {
    id: string;
    child: Child;
    parentIndex: number;
    childIndex: number;
    register: any;
    removeChild: (parentIndex: number, childIndex: number) => void;
};

export type SortableSidebarParentItemProps = {
    parentField: any;
    parent: Parent;
    parentIndex: number;
};

export type SortableSidebarChildItemProps = {
    id: string;
    child: Child;
    parentIndex: number;
    childIndex: number;
};
