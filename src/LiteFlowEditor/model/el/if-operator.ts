import { Cell, Node, Edge } from '@antv/x6';
import ELNode, { Properties, ELEndNode } from '../node';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_INTERMEDIATE_END,
  NodeTypeEnum,
} from '../../constant';
import NodeOperator from './node-operator';

/**
 * 条件编排操作符：IF。
 *
 * 例如一个条件编排(IF)示例：
 * (1) EL表达式语法：IF(x, a)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.IF,
    condition: { type: NodeTypeEnum.IF, id: 'x' },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' }
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘
  │  Chain  │───▶│    IfOperator   │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  └──▶│  NodeOperator   │
                                          └─────────────────┘
 */
export default class IfOperator extends ELNode {
  type = ConditionTypeEnum.IF;
  parent?: ELNode;
  condition: ELNode = new NodeOperator(this, NodeTypeEnum.IF, 'x');
  children: ELNode[] = [];
  properties?: Properties;
  startNode?: Node;
  endNode?: Node;

  constructor(
    parent?: ELNode,
    condition?: ELNode,
    children?: ELNode[],
    properties?: Properties,
  ) {
    super();
    this.parent = parent;
    if (condition) {
      this.condition = condition;
    }
    if (children) {
      this.children = children;
    }
    this.properties = properties;
  }

  /**
   * 创建新的节点
   * @param parent 新节点的父节点
   * @param type 新节点的子节点类型
   */
  public static create(parent?: ELNode, type?: NodeTypeEnum): ELNode {
    const newNode = new IfOperator(parent);
    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(
    cells: Cell[] = this.cells,
    options: Record<string, any> = {},
  ): Cell[] {
    this.resetCells(cells);
    const { condition, children = [] } = this;
    const start = Node.create({
      shape: NodeTypeEnum.IF,
      attrs: {
        label: { text: condition.id },
      },
    });
    start.setData({ model: condition }, { overwrite: true });
    cells.push(this.addNode(start));
    this.startNode = start;

    const end = Node.create({
      shape: NODE_TYPE_INTERMEDIATE_END,
      attrs: {
        label: { text: '' },
      },
    });
    end.setData({ model: new ELEndNode(this) }, { overwrite: true });
    cells.push(this.addNode(end));
    this.endNode = end;

    const [first, last] = children;
    first.toCells([], options);
    const trueNode = first.getStartNode();
    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: start.id,
        target: trueNode.id,
        label: 'true',
      }),
    );
    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: trueNode.id,
        target: end.id,
      }),
    );
    let falseNode;
    if (!last) {
      falseNode = Node.create({
        shape: NodeTypeEnum.VIRTUAL,
        view: 'react-shape-view',
        attrs: {
          label: { text: '' },
        },
      });
      falseNode.setData({ model: new ELEndNode(this) }, { overwrite: true });
      cells.push(this.addNode(falseNode));
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: start.id,
          target: falseNode.id,
          label: 'false',
        }),
      );
    } else {
      last.toCells([], options);
      falseNode = last.getStartNode();
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: start.id,
        target: falseNode.id,
        label: 'false',
      });
    }
    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: falseNode.id,
        target: end.id,
      }),
    );
    return this.getCells();
  }

  /**
   * 获取当前节点的开始节点
   */
  public getStartNode(): Node {
    return this.startNode as Node;
  }

  /**
   * 获取当前节点的结束节点
   */
  public getEndNode(): Node {
    return this.endNode as Node;
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return `IF(${[
      this.condition.toEL(),
      ...this.children.map((x) => x.toEL()),
    ].join(', ')})${this.propertiesToEL()}`;
  }

  /**
   * 转换为JSON格式
   */
  public toJSON(): Record<string, any> {
    const { type, condition, children, properties } = this;
    return {
      type,
      condition: condition.toJSON(),
      children: children.map((child) => child.toJSON()),
      properties,
    };
  }
}
