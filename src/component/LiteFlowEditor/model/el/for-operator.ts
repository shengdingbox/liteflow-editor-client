import { Cell, Edge, Node } from '@antv/x6';
import ELNode, { Properties } from '../node';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_INTERMEDIATE_END,
} from '../../constant';

export default class ForOperator implements ELNode {
  type = ConditionTypeEnum.FOR;
  parent: ELNode;
  condition: ELNode;
  children: ELNode[];
  properties?: Properties;

  constructor(
    parent: ELNode,
    condition: ELNode,
    children: ELNode[],
    properties?: Properties,
  ) {
    this.parent = parent;
    this.condition = condition;
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
    const { condition, children, parent } = this;
    const start = Node.create({
      shape: condition.type,
      view: 'react-shape-view',
      attrs: {
        label: { text: condition.id },
      },
    });
    start.setData({ model: this, parent }, { overwrite: true });
    cells.push(start);
    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: previous.id,
        target: start.id,
      }),
    );
    const end = Node.create({
      shape: NODE_TYPE_INTERMEDIATE_END,
      view: 'react-shape-view',
      attrs: {
        label: { text: '' },
      },
    });
    end.setData({ model: this, parent }, { overwrite: true });
    if (children.length === 1 && children[0].type === ConditionTypeEnum.THEN) {
      children[0].children?.forEach((child) => {
        const next = child.toCells(start, cells, options) as Node;
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: next.id,
            target: end.id,
          }),
        );
      });
    } else {
      children.forEach((child) => {
        const next = child.toCells(start, cells, options) as Node;
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: next.id,
            target: end.id,
          }),
        );
      });
    }
    cells.push(end);
    return end;
  }
  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return `FOR(${this.condition.toEL()}).DO(${this.children
      .map((x) => x.toEL())
      .join(', ')})`;
  }
}
