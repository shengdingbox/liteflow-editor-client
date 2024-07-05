import { Cell, Node, Edge } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ELStartNode, ELEndNode } from '../utils';
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
    start.setData({ model: new ELStartNode(this) }, { overwrite: true });
    cells.push(this.addNode(start));
    this.startNode = start;

    const end = Node.create({
      shape: NODE_TYPE_INTERMEDIATE_END,
      attrs: {
        label: { text: '' },
      },
    });
    end.setData({ model: new ELEndNode(this) }, { overwrite: true });
    cells.push(this.addNode(end));
    this.endNode = end;

    if (children.length) {
      children.forEach((child) => {
        child.toCells([], {});
        const nextStartNode = child.getStartNode();
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: start.id,
            target: nextStartNode.id,
            label: ' - ',
            defaultLabel: {
              position: {
                distance: 0.5,
                options: {
                  keepGradient: false,
                  ensureLegibility: false,
                }
              }
            }
          }),
        );
        const nextEndNode = child.getEndNode();
        cells.push(
          Edge.create({
            shape: LITEFLOW_EDGE,
            source: nextEndNode.id,
            target: end.id,
          }),
        );
      });
    } else {
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: start.id,
          target: end.id,
        }),
      );
    }

    return this.getCells();
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
