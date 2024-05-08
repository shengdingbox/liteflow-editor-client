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

/**
 * 将EL表达式的JSON表示，构造成ELNode模型表示。
 * EL表达式的模型表示：数据结构本质上是一个树形结构。
 * 例如一个串行编排(THEN)：
  {
    type: ConditionTypeEnum.THEN,
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },
      { type: NodeTypeEnum.COMMON, id: 'c' },
      { type: NodeTypeEnum.COMMON, id: 'd' },
    ],
  }
 * 通过ELNode节点模型表示为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      ├──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘
  │  Chain  │───▶│  ThenOperator   │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  ├──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      └──▶│  NodeOperator   │
                                          └─────────────────┘
 */
export class ELBuilder {
  public static build(data: Record<string, any>) {
    return builder(data);
  }
  public static createELNode(
    type: ConditionTypeEnum | NodeTypeEnum,
    parent: ELNode,
  ): ELNode {
    switch (type) {
      // 1. 编排类型
      case NodeTypeEnum.COMMON:
        return ThenOperator.create(parent);
      case ConditionTypeEnum.WHEN:
        return WhenOperator.create(parent);
      case NodeTypeEnum.SWITCH:
        return SwitchOperator.create(parent);
      case NodeTypeEnum.IF:
        return IfOperator.create(parent);
      case NodeTypeEnum.FOR:
        return ForOperator.create(parent);
      case NodeTypeEnum.WHILE:
        return WhileOperator.create(parent);
      // 2. 节点类型
      default:
        // return NodeOperator.create(parent, type as NodeTypeEnum);
        return NodeOperator.create(parent, NodeTypeEnum.COMMON);
    }
  }
}

export default function builder(data: Record<string, any>): ELNode {
  const chain: Chain = new Chain();
  let next: ELNode | undefined = parse({ parent: chain, data });
  if (next) {
    chain.appendChildAt(next);
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
      parent.appendChildAt(childNode);
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
      parent.appendChildAt(childNode);
    }
  });
  return parent;
}
