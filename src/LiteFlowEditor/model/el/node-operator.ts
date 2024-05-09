import { Cell, Node, Edge } from '@antv/x6';
import ELNode from '../node';
import { LITEFLOW_EDGE, NodeTypeEnum } from '../../constant';

/**
 * 节点组件操作符：是EL表达式树型结构的叶子结点。
 *
 * 例如一个串行编排(THEN)：
 * (1) EL表达式形式：THEN(a, b, c, d)
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
export default class NodeOperator extends ELNode {
  type: NodeTypeEnum;
  parent?: ELNode;
  id: string;

  constructor(parent?: ELNode, type?: NodeTypeEnum, id?: string) {
    super();
    this.parent = parent;
    this.type = type || NodeTypeEnum.COMMON;
    this.id = id || `common${Math.ceil(Math.random() * 100)}`;
  }

  /**
   * 创建新的节点
   * @param parent 新节点的父节点
   * @param type 新节点的节点类型
   * @param id 新节点的节点Id
   */
  public static create(
    parent?: ELNode,
    type?: NodeTypeEnum,
    id?: string,
  ): ELNode {
    return new NodeOperator(parent, type, id);
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
    node.setData({ model: this }, { overwrite: true });
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
