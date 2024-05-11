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
 * 选择编排操作符：SWITCH。
 *
 * 例如一个选择编排(SWITCH)示例：
 * (1) EL表达式语法：SWITCH(x).to(a, b, c)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.SWITCH,
    condition: { type: NodeTypeEnum.SWITCH, id: 'x' },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },
      { type: NodeTypeEnum.COMMON, id: 'c' },
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      ├──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘
  │  Chain  │───▶│ SwitchOperator  │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  ├──▶│  NodeOperator   │
                                      │   └─────────────────┘
                                      │   ┌─────────────────┐
                                      └──▶│  NodeOperator   │
                                          └─────────────────┘
 */
export default class SwitchOperator extends ELNode {
  type = ConditionTypeEnum.SWITCH;
  parent?: ELNode;
  condition: ELNode = new NodeOperator(this, NodeTypeEnum.SWITCH, 'x');
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
    const newNode = new SwitchOperator(parent);
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
    const { condition, children } = this;
    const start = Node.create({
      shape: condition.type,
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

    if (children.length) {
      children.forEach((child) => {
        child.toCells([], options);
        const childStartNode = child.getStartNode();
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: start.id,
            target: childStartNode.id,
          }),
        );
        const childEndNode = child.getEndNode();
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: childEndNode.id,
            target: end.id,
          }),
        );
      });
    } else {
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: start.id,
          target: end.id,
        }),
      );
    }

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
    return `SWITCH(${this.condition.toEL()}).to(${this.children
      .map((x) => x.toEL())
      .join(', ')})`;
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
