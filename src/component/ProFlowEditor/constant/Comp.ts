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
  | 'root'
  | 'common'
  | 'then'
  | 'when'
  | 'switch'
  | 'if'
  | 'for'
  | 'while';

interface LiteNodeComp extends NodeComp {
  type: LiteNodeType;
  shape: string;
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

const RootComp: LiteNodeComp = {
  type: 'root',
  childrenType: 'then',
  shape: 'LITEFLOW_START',
};

const CommonComp: LiteNodeComp = {
  type: 'common',
  shape: 'NodeComponent',
};

const ThenComp: LiteNodeComp = {
  type: 'then',
  childrenType: 'then',
  shape: 'NodeComponent',
};

const WhenComp: LiteNodeComp = {
  type: 'when',
  childrenType: 'multiple',
  multipleType: 'when',
  shape: 'WHEN',
};

const SwitchComp: LiteNodeComp = {
  type: 'switch',
  childrenType: 'multiple',
  multipleType: 'switch',
  shape: 'NodeSwitchComponent',
};

const IfComp: LiteNodeComp = {
  type: 'if',
  childrenType: 'multiple',
  multipleType: 'if',
  shape: 'NodeIfComponent',
};

const ForComp: LiteNodeComp = {
  type: 'for',
  childrenType: 'include',
  shape: 'NodeForComponent',
};

const WhileComp: LiteNodeComp = {
  type: 'while',
  childrenType: 'include',
  shape: 'NodeWhileComponent',
};

export const NodeCompStore = {
  [RootComp.type]: RootComp,
  [CommonComp.type]: CommonComp,
  [ThenComp.type]: ThenComp,
  [WhenComp.type]: WhenComp,
  [SwitchComp.type]: SwitchComp,
  [IfComp.type]: IfComp,
  [ForComp.type]: ForComp,
  [WhileComp.type]: WhileComp,
};
