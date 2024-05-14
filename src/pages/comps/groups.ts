import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import { ForNode } from './for';
import { IfNode } from './if';
import { SwitchNode } from './switch';
import { ThenNode } from './then';
import { WhenNode } from './when';
import { WhileNode } from './while';

export const compGroups: Array<[string, NodeComp[]]> = [
  ['顺序类', [ThenNode, WhenNode]],
  ['分支类', [IfNode, SwitchNode]],
  ['循环类', [ForNode, WhileNode]],
];
