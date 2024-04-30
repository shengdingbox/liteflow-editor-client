import { Cell, Node, Edge } from '@antv/x6';
import ELNode from '../node';
import { LITEFLOW_EDGE, NodeTypeEnum } from '../../constant';

export default class NodeOperator implements ELNode {
  type: NodeTypeEnum;
  parent: ELNode;
  id: string;

  constructor(parent: ELNode, type: NodeTypeEnum, id: string) {
    this.parent = parent;
    this.type = type;
    this.id = id;
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(
    previous: Node,
    cells: Cell[],
    options: Record<string, any> = {},
  ): Node {
    const { id, type, parent } = this;
    const node = Node.create({
      shape: type,
      attrs: {
        label: { text: id },
      },
      ...(options.node || {}),
    });
    node.setData({ model: this, parent }, { overwrite: true });
    cells.push(node);

    if (previous) {
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: previous.id,
          target: node.id,
          ...(options.edge || {}),
        }),
      );
    }
    return node;
  }
  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return this.id;
  }
}
