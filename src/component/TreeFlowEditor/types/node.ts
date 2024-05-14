export interface BaseCompProps {}

export interface NodeComp {
  metadata: {
    type: string;
    label?: string;
    icon?: React.ReactNode;
    childrenType?: 'then' | 'include' | 'multiple';
    multipleType?: 'if' | 'switch' | 'when';
  };

  defaults?: Array<Omit<NodeData, 'id' | 'type'>>;
}

export interface NodeData {
  id: string;
  type: string;
  label?: string;
  props?: Record<string, any>;
  children?: NodeData[];
  multiple?: Array<{
    name?: string;
    children: NodeData[];
  }>;
}
