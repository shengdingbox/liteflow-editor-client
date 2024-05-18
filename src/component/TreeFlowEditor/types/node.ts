export interface BaseCompProps {}

export interface NodeComp {
  metadata: {
    type: string;
    label?: string;
    icon?: React.ReactNode;
    childrenType?: 'then' | 'include' | 'multiple';
    multipleType?: 'two' | 'mutable';
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

export interface AdvNodeData extends NodeData {
  isVirtual?: boolean;
  canDelete?: boolean;
}

export interface CellPosition {
  parent?: NodeData;
  multiIndex?: number;
  childrenIndex?: number;
}
