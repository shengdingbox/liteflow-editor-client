import { Cell, Node, Edge } from '@antv/x6';
import ELNode from './node';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_END,
  NODE_TYPE_START,
} from '../constant';

/**
 * EL表达式的根节点——EL表达式的所有延伸内容，都是在根节点上开始的。
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
    start.setData(
      { model: this, toolbar: { prepend: false, append: true, delete: true } },
      { overwrite: true },
    );

    cells.push(start);

    // 2. 其次：解析已有的节点
    let last: Node = start;
    this.children.forEach((x) => {
      last = x.toCells(last, cells) as Node;
    });

    // 3. 最后：添加一个结束节点
    const end: Node = Node.create({
      shape: NODE_TYPE_END,
      attrs: {
        label: { text: '结束' },
      },
    });
    end.setData(
      { model: this, toolbar: { prepend: true, append: false, delete: true } },
      { overwrite: true },
    );
    cells.push(end);

    cells.push(
      Edge.create({
        shape: LITEFLOW_EDGE,
        source: last.id,
        target: end.id,
      }),
    );

    return cells;
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return this.children.map((x) => x.toEL()).join(', ');
  }

  /**
   * 在开始节点的后面、插入新节点
   * @param newNode 新节点
   * @returns
   */
  public append(newNode: ELNode): boolean {
    if (this.children.length === 1) {
      return this.children[0].prependChild(newNode, 0);
    }
    this.children.push(newNode);
    return true;
  }

  /**
   * 在结束节点的前面、插入新节点
   * @param child 新节点
   * @returns
   */
  public prepend(newNode: ELNode): boolean {
    if (this.children.length === 1) {
      return this.children[0].appendChild(newNode);
    }
    this.children.push(newNode);
    return true;
  }
}
