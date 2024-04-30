import { Cell, Node, Edge } from '@antv/x6';
import ELNode, { Properties } from '../node';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_INTERMEDIATE_END,
  NODE_TYPE_VIRTUAL,
} from '../../constant';

export default class IfOperator implements ELNode {
  type = ConditionTypeEnum.IF;
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
    const { condition, children = [], parent } = this;
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
    const [first, last] = children;
    const trueNode = first.toCells(start, cells, {
      edge: { label: 'true' },
    }) as Node;
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
        shape: NODE_TYPE_VIRTUAL,
        view: 'react-shape-view',
        attrs: {
          label: { text: '' },
        },
      });
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: start.id,
          target: falseNode.id,
          label: 'false',
        }),
      );
    } else {
      falseNode = last.toCells(start, cells, {
        edge: { label: 'false' },
      }) as Node;
    }

    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: falseNode.id,
        target: end.id,
      }),
    );
    cells.push(end);
    return end;
  }
  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return `IF(${[
      this.condition.toEL(),
      ...this.children.map((x) => x.toEL()),
    ].join(', ')})`;
  }
}