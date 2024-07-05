import { Cell, Node, Edge } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ELStartNode, ELEndNode, ELVirtualNode } from '../utils';
import {
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  NODE_TYPE_INTERMEDIATE_END,
  NodeTypeEnum,
} from '../../constant';
import NodeOperator from './node-operator';

/**
 * 非操作符：NOT。
 *
 * 例如一个非(NOT)示例：
 * (1) EL表达式语法：IF(NOT(a)), b)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.IF,
    condition: {
      type: ConditionTypeEnum.NOT,
      children: [
        { type: NodeTypeEnum.COMMON, id: 'a' }
      ]
    },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'b' }
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐    ┌─────────────────┐
                                      ┌──▶│  NotOperator    │───▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘    └─────────────────┘
  │  Chain  │───▶│   IfOperator    │──┤   ┌─────────────────┐
  └─────────┘    └─────────────────┘  └──▶│  NodeOperator   │
                                          └─────────────────┘
 */
export default class NotOperator extends ELNode {
  type = ConditionTypeEnum.NOT;
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
    const newNode = new NotOperator(parent);
    newNode.appendChild(NodeOperator.create(newNode, type));
    return newNode;
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(
    cells: Cell[] = [],
    options: Record<string, any> = {},
  ): Cell[] {
    this.resetCells(cells);
    const { children } = this;
    const start = Node.create({
      shape: ConditionTypeEnum.NOT,
      attrs: {
        label: { text: '' },
      },
      ...options,
    });
    start.setData({
      model: new ELStartNode(this),
      toolbar: {
        prepend: true,
        append: false,
        delete: true,
        replace: true,
      },
    }, { overwrite: true });
    cells.push(this.addNode(start));
    this.startNode = start;

    const end = Node.create({
      shape: NODE_TYPE_INTERMEDIATE_END,
      attrs: {
        label: { text: '' },
      },
    });
    end.setData({
      model: new ELEndNode(this),
      toolbar: {
        prepend: false,
        append: true,
        delete: true,
        replace: true,
      },
    }, { overwrite: true });
    cells.push(this.addNode(end));
    this.endNode = end;

    const [notNode] = children;
    [notNode].forEach((item, index) => {
      const next = item || NodeOperator.create(this, NodeTypeEnum.VIRTUAL, ' ');
      next.toCells([], {});
      const nextStartNode = next.getStartNode();
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: start.id,
          target: nextStartNode.id,
          label: ' - ',
          defaultLabel: {
            attrs: {
              fo: { x: -20, y: -20, },
            },
            position: {
              options: {
                keepGradient: false,
                ensureLegibility: false,
              }
            }
          }
        }),
      );
      const nextEndNode = next.getEndNode();
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: nextEndNode.id,
          target: end.id,
          label: ' ',
        }),
      );

      if (!item) {
        nextStartNode.setData(
          {
            model: new ELVirtualNode(this, index, next),
            toolbar: {
              prepend: false,
              append: false,
              delete: false,
              replace: true,
            },
          },
          { overwrite: true },
        );
        cells.push(this.addNode(nextStartNode));
      }
    });

    return this.getCells();
  }

  /**
   * 在后面添加子节点
   * @param newNode 子节点
   * @param index 指定位置：可以是索引，也可以是兄弟节点
   */
  public appendChild(newNode: ELNode): boolean;
  public appendChild(newNode: ELNode, index: number): boolean;
  public appendChild(newNode: ELNode, sibling: ELNode): boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public appendChild(newNode: ELNode, index?: number | ELNode): boolean {
    newNode.parent = this;
    this.children[0] = newNode;
    return true;
  }

  /**
   * 在后面添加子节点
   * @param newNode 子节点
   * @param index 指定位置：可以是索引，也可以是兄弟节点
   */
  public prependChild(newNode: ELNode): boolean;
  public prependChild(newNode: ELNode, index: number): boolean;
  public prependChild(newNode: ELNode, sibling: ELNode): boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public prependChild(newNode: ELNode, index?: number | ELNode): boolean {
    newNode.parent = this;
    this.children[0] = newNode;
    return true;
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(prefix: string = ''): string {
    if (prefix) {
      return `${prefix}NOT(\n${this.children
        .map((x) => x.toEL(`${prefix}  `))
        .join(', \n')}\n${prefix})${this.propertiesToEL()}`;
    }
    return `NOT(${this.children
      .map((x) => x.toEL())
      .join(', ')})${this.propertiesToEL()}`;
  }
}
