import { Cell, Node, Edge } from '@antv/x6';
import ELNode, { Properties, ELStartNode, ELEndNode } from '../node';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_INTERMEDIATE_END,
  NodeTypeEnum,
} from '../../constant';
import NodeOperator from './node-operator';

/**
 * 并行编排操作符：WHEN。
 *
 * 例如一个并行编排(WHEN)示例：
 * (1) EL表达式语法：THEN(a, WHEN(b, c, d), e)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.THEN,
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      {
        type: ConditionTypeEnum.WHEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'b' },
          { type: NodeTypeEnum.COMMON, id: 'c' },
          { type: NodeTypeEnum.COMMON, id: 'd' },
        ],
      },
      { type: NodeTypeEnum.COMMON, id: 'e' },
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐      ┌─────────────────┐
                                      ┌──▶│  NodeOperator   │  ┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘  │   └─────────────────┘
  │  Chain  │───▶│  ThenOperator   │──┤   ┌─────────────────┐  │   ┌─────────────────┐
  └─────────┘    └─────────────────┘  ├──▶│  WhenOperator   │──┼──▶│  NodeOperator   │
                                      │   └─────────────────┘  │   └─────────────────┘
                                      │   ┌─────────────────┐  │   ┌─────────────────┐
                                      └──▶│  NodeOperator   │  └──▶│  NodeOperator   │
                                          └─────────────────┘      └─────────────────┘
 */
export default class WhenOperator extends ELNode {
  type = ConditionTypeEnum.WHEN;
  parent?: ELNode;
  children: ELNode[] = [];
  properties?: Properties;
  startNode?: Node;
  endNode?: Node;

  constructor(parent?: ELNode, children?: ELNode[], properties?: Properties) {
    super();
    this.parent = parent;
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
    const newNode = new WhenOperator(parent);
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
    const { children } = this;
    const start = Node.create({
      shape: ConditionTypeEnum.WHEN,
      attrs: {
        label: { text: '' },
      },
    });
    start.setData({ model: new ELStartNode(this) }, { overwrite: true });
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
        const nextStartNode = child.getStartNode();
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: start.id,
            target: nextStartNode.id,
          }),
        );
        const nextEndNode = child.getEndNode();
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: nextEndNode.id,
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
    return `WHEN(${this.children
      .map((x) => x.toEL())
      .join(', ')})${this.propertiesToEL()}`;
  }

  /**
   * 转换为JSON格式
   */
  public toJSON(): Record<string, any> {
    const { type, children, properties } = this;
    return {
      type,
      children: children.map((child) => child.toJSON()),
      properties,
    };
  }
}
