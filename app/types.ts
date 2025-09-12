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