import Chain from './chain';
import {
  ThenOperator,
  WhenOperator,
  SwitchOperator,
  IfOperator,
  ForOperator,
  WhileOperator,
  NodeOperator,
} from './el';
import { NodeTypeEnum, ConditionTypeEnum } from '../constant';
import ELNode from './node';

interface ParseParameters {
  data: Record<string, any>;
  parent: ELNode;
}

export default function builder(data: Record<string, any>): ELNode {
  const chain: Chain = new Chain();
  let next: ELNode | undefined = parse({ parent: chain, data });
  if (next) {
    chain.appendChild(next);
  }
  return chain;
}

export function parse({ parent, data }: ParseParameters): ELNode | undefined {
  if (!data.type) {
    return undefined;
  }

  switch (data.type) {
    // 1、编排类：顺序、分支、循环
    case ConditionTypeEnum.THEN:
      return parseSequence({ parent: new ThenOperator(parent), data });
    case ConditionTypeEnum.WHEN:
      return parseSequence({ parent: new WhenOperator(parent), data });
    case ConditionTypeEnum.SWITCH:
      return parseControl({ parent: new SwitchOperator(parent), data });
    case ConditionTypeEnum.IF:
      return parseControl({ parent: new IfOperator(parent), data });
    case ConditionTypeEnum.FOR:
      return parseControl({ parent: new ForOperator(parent), data });
    case ConditionTypeEnum.WHILE:
      return parseControl({ parent: new WhileOperator(parent), data });

    // 2、组件类：顺序、分支、循环
    case NodeTypeEnum.COMMON:
    default:
      return new NodeOperator(parent, data.type, data.id);
  }
}

function parseSequence({ parent, data }: ParseParameters): ELNode {
  const { children = [] } = data;
  children.forEach((child: Record<string, any>) => {
    const childNode = parse({ parent, data: child });
    if (childNode) {
      parent.appendChild(childNode);
    }
  });
  return parent;
}

function parseControl({ parent, data }: ParseParameters): ELNode {
  const { condition, children = [] } = data;
  const conditionNode = parse({ parent, data: condition });
  if (conditionNode) {
    parent.condition = conditionNode;
  }
  children.forEach((child: Record<string, any>) => {
    const childNode = parse({ parent, data: child });
    if (childNode) {
      parent.appendChild(childNode);
    }
  });
  return parent;
}
