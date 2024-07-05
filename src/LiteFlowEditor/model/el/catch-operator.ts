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
import IntermediateErrorBoundaryIcon from '../../assets/intermediate-event-catch-error.svg'

/**
 * 捕获异常操作符：CATCH。
 *
 * 例如一个捕获异常(CATCH)示例：
 * (1) EL表达式语法：CATCH(THEN(a, b)).DO(c)
 * (2) JSON表示形式：
 * {
    type: ConditionTypeEnum.CATCH,
    condition: {
      type: NodeTypeEnum.THEN,
      children: [
        { type: NodeTypeEnum.COMMON, id: 'a' },
        { type: NodeTypeEnum.COMMON, id: 'b' }
      ]
    },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'c' }
    ],
  }
  * (3) 通过ELNode节点模型进行表示的组合关系为：
                                          ┌─────────────────┐      ┌─────────────────┐
                                      ┌──▶│  ThenOperator   │──┌──▶│  NodeOperator   │
  ┌─────────┐    ┌─────────────────┐  │   └─────────────────┘  │   └─────────────────┘
  │  Chain  │───▶│  CatchOperator  │──┤   ┌─────────────────┐  │   ┌─────────────────┐
  └─────────┘    └─────────────────┘  └──▶│  NodeOperator   │  └──▶│  NodeOperator   │
                                          └─────────────────┘      └─────────────────┘


 */
export default class CatchOperator extends ELNode {
  type = ConditionTypeEnum.CATCH;
  parent?: ELNode;
  condition?: ELNode = new NodeOperator(this, NodeTypeEnum.COMMON, 'x');
  children: ELNode[] = [];
  properties?: Properties;
  startNode?: Node;
  endNode?: Node;

  constructor(parent?: ELNode, condition?: ELNode, children?: ELNode[], properties?: Properties) {
    super();
    this.parent = parent;
    if (condition) {
      this.condition = condition;
    }
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
    const newNode = new CatchOperator(parent);
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
    const { condition, children } = this;
    const start = Node.create({
      shape: ConditionTypeEnum.CATCH,
      attrs: {
        label: { text: '' },
      },
      portMarkup: [
        {
          tagName: 'image',
          selector: 'circle',
          attrs: {
            x: -6,
            y: -6,
            width: 12,
            height: 12,
            'xlink:href': IntermediateErrorBoundaryIcon,
          },
        }
      ],
      ports: {
        groups: {
          bottom: {
            position: { name: 'bottom' },
            zIndex: 1,
          },
        },
        items: [
          { group: 'bottom', id: 'bottom' }
        ]
      },
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

    [condition, ...children].forEach((item: ELNode | undefined, index: number) => {
      const next = item || NodeOperator.create(this, NodeTypeEnum.VIRTUAL, ' ');
      next.toCells([], options);
      const nextStartNode = next.getStartNode();
      cells.push(
        Edge.create({
          shape: LITEFLOW_EDGE,
          source: start.id,
          target: nextStartNode.id,
          label: index === 1 ? '异常' : ' ',
          defaultLabel: {
            position: {
              distance: 0.3,
            },
          },
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
  public appendChild(newNode: ELNode, index?: number | ELNode): boolean {
    newNode.parent = this;
    // 没有condition节点，则优先添加为condition节点
    if (!this.condition) {
      this.condition = newNode;
      return true;
    }

    if (this.children) {
      // 尝试在父节点中添加新节点
      if (typeof index === 'number') {
        // 1. 如果有索引
        this.children[0] = newNode;
        return true;
      }
      if (index) {
        // 2. 如果有目标节点
        const _index = this.children.indexOf(index);
        if (_index !== -1) {
          this.children[0] = newNode;
          return true;
        }
        // 3. 如果是在condition之后追加
        if (this.condition === index) {
          this.condition = newNode;
          return true;
        }
      }
      // 4. 否则直接插入
      this.children[0] = newNode;
      return true;
    }
    return false;
  }

  /**
   * 在后面添加子节点
   * @param newNode 子节点
   * @param index 指定位置：可以是索引，也可以是兄弟节点
   */
  public prependChild(newNode: ELNode): boolean;
  public prependChild(newNode: ELNode, index: number): boolean;
  public prependChild(newNode: ELNode, sibling: ELNode): boolean;
  public prependChild(newNode: ELNode, index?: number | ELNode): boolean {
    newNode.parent = this;
    // 没有condition节点，则优先添加为condition节点
    if (!this.condition) {
      this.condition = newNode;
      return true;
    }

    if (this.children) {
      // 尝试在父节点中添加新节点
      if (typeof index === 'number') {
        // 1. 如果有索引
        this.children[0] = newNode;
        return true;
      }
      if (index) {
        // 2. 如果有目标节点
        const _index = this.children.indexOf(index);
        if (_index !== -1) {
          this.children[0] = newNode;
          return true;
        }
        if (this.condition === index) {
          // 3. 如果是在condition之前追加
          this.condition = newNode;
          return true;
        }
      }
      // 4. 否则直接插入
      this.children[0] = newNode;
      return true;
    }
    return false;
  }

  /**
   * 删除指定的子节点
   * @param child 子节点
   */
  public removeChild(child: ELNode): boolean {
    if (this.children) {
      const index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
        return true;
      }
    }
    if (this.condition && this.condition === child) {
      this.condition = undefined;
      return true;
    }
    return false;
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(prefix: string = ''): string {
    const catchNode = this.condition;
    const [doNode] = this.children;
    if (prefix) {
      return `${prefix}CATCH(\n${catchNode ? catchNode.toEL(`${prefix}  `) : ''}\n${prefix})${doNode ? `.DO(\n${doNode.toEL(`${prefix}  `)}\n${prefix})` : ''}${this.propertiesToEL()}`;
    }
    return `CATCH(${catchNode ? catchNode.toEL() : ''})${doNode ? `.DO(${doNode.toEL()})` : ''}${this.propertiesToEL()}`;
  }
}
