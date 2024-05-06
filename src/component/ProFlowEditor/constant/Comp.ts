interface NodeComp {
  type: string;
  childrenType?: 'then' | 'include' | 'multiple';
  multipleType?: 'if' | 'switch' | 'when';
}

export interface NodeData {
  type: string;
  props?: Record<string, any>;
  children?: NodeData[];
  multiple?: Array<{
    name?: string;
    children: NodeData[];
  }>;
}

type LiteNodeType =
  | 'common'
  | 'then'
  | 'when'
  | 'switch'
  | 'if'
  | 'for'
  | 'while';

interface LiteNodeComp extends NodeComp {
  type: LiteNodeType;
}

export interface LiteNodeData extends NodeData {
  type: LiteNodeType;
  props?: Record<string, any>;
  children?: LiteNodeData[];
  multiple?: Array<{
    name?: string;
    children: LiteNodeData[];
  }>;
}

const CommonComp: LiteNodeComp = {
  type: 'common',
};

const ThenComp: LiteNodeComp = {
  type: 'then',
  childrenType: 'then',
};

const WhenComp: LiteNodeComp = {
  type: 'when',
  childrenType: 'multiple',
  multipleType: 'when',
};

const SwitchComp: LiteNodeComp = {
  type: 'switch',
  childrenType: 'multiple',
  multipleType: 'switch',
};

const IfComp: LiteNodeComp = {
  type: 'if',
  childrenType: 'multiple',
  multipleType: 'if',
};

const ForComp: LiteNodeComp = {
  type: 'for',
  childrenType: 'include',
};

const WhileComp: LiteNodeComp = {
  type: 'while',
  childrenType: 'include',
};

export const NodeCompStore = {
  [CommonComp.type]: CommonComp,
  [ThenComp.type]: ThenComp,
  [WhenComp.type]: WhenComp,
  [SwitchComp.type]: SwitchComp,
  [IfComp.type]: IfComp,
  [ForComp.type]: ForComp,
  [WhileComp.type]: WhileComp,
};
