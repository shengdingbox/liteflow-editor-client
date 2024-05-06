import { Cell, Node } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ConditionTypeEnum, NodeTypeEnum } from '../../constant';
import NodeOperator from './node-operator';

export default class ThenOperator extends ELNode {
  type = ConditionTypeEnum.THEN;
  parent: ELNode;
  children: ELNode[] = [];
  properties?: Properties;

  constructor(parent: ELNode, children?: ELNode[], properties?: Properties) {
    super();
    this.parent = parent;
    if (children) {
      this.children = children;
    }
    this.properties = properties;
  }

  /**
   * 创建新的节点
   * @param parent 父节点
   */
  public static create(parent: ELNode): ELNode {
    const newNode = new ThenOperator(parent, []);
    newNode.children = [NodeOperator.create(newNode)];
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
}
