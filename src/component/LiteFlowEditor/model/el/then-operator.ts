import { Cell, Node } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ConditionTypeEnum } from '../../constant';

export default class ThenOperator implements ELNode {
  type = ConditionTypeEnum.THEN;
  parent: ELNode;
  children: ELNode[];
  properties?: Properties;

  constructor(parent: ELNode, children: ELNode[], properties?: Properties) {
    this.parent = parent;
    this.children = children;
    this.properties = properties;
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
