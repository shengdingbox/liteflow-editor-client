import { Cell, Node, Edge } from '@antv/x6';
import ELNode from './node';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_END,
  NODE_TYPE_START,
} from '../constant';

/**
 * EL表达式的根节点。
 */
export default class Chain extends ELNode {
  type = ConditionTypeEnum.CHAIN;
  children: ELNode[] = [];

  constructor(children?: ELNode[]) {
    super();
    if (children) {
      this.children = children;
    }
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(): Cell[] {
    const cells: Cell[] = [];
    // 1. 首先：添加一个开始节点
    const start: Node = Node.create({
      shape: NODE_TYPE_START,
      attrs: {
        label: { text: '开始' },
      },
    });
    start.setData({ model: this, parent: undefined }, { overwrite: true });

    cells.push(start);

    // 2. 其次：解析已有的节点
    let nextCells: Cell[] = [];
    this.children.forEach((x) => {
      nextCells = nextCells.concat(x.toCells(start, cells));
    });

    // 3. 最后：添加一个结束节点
    const last: Node = Node.create({
      shape: NODE_TYPE_END,
      attrs: {
        label: { text: '结束' },
      },
    });
    last.setData({ model: this, parent: undefined }, { overwrite: true });
    cells.push(last);

    nextCells.forEach((next) => {
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: next.id,
          target: last.id,
        }),
      );
    });

    return cells;
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return this.children.map((x) => x.toEL()).join(', ');
  }
}
