import { Cell, Node } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ConditionTypeEnum, NodeTypeEnum } from '../../constant';
import NodeOperator from './node-operator';

/**
 * 串行编排操作符：THEN。
 *
 * 例如一个串行编排(THEN)示例：
 * (1) EL表达式语法：THEN(a, b, c, d)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.THEN,
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },
      { type: NodeTypeEnum.COMMON, id: 'c' },
      { type: NodeTypeEnum.COMMON, id: 'd' },
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
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
export default class ThenOperator extends ELNode {
  type = ConditionTypeEnum.THEN;
  parent?: ELNode;
  children: ELNode[] = [];
  properties?: Properties;

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
    const newNode = new ThenOperator(parent);
    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  /**
   * 删除指定的子节点
   * @param child 子节点
   */
  public removeChild(child: ELNode): boolean {
    if (this.children && this.children.length > 1) {
      return super.removeChild(child);
    } else {
      return this.remove();
    }
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(
    previous: Node,
    cells: Cell[],
    options?: Record<string, any>,
  ): Node {
    const { children } = this;
    let last: Node = previous;
    children.forEach((child) => {
      last = child.toCells(last, cells, options) as Node;
    });
    return last;
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return `THEN(${this.children.map((x) => x.toEL()).join(', ')})`;
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
