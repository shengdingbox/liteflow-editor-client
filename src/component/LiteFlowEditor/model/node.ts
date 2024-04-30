import { Cell, Node } from '@antv/x6';
import { ConditionTypeEnum, NodeTypeEnum } from '../constant';

/**
 * EL表达式的JSON表示：数据结构本质上是一个树形结构。
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
 */
export default interface ELNode {
  // 节点类型：可以是编排类型，也可以是组件类型
  type: ConditionTypeEnum | NodeTypeEnum;
  // 当前节点的子节点：编排类型有子节点，组件类型没有子节点
  children?: ELNode[];
  // 当前节点的父节点
  parent?: ELNode;
  // 判断类节点类型：主要用于SWITCH/IF/FOR/WHILE等类型
  condition?: ELNode;
  // 组件节点的id
  id?: string;
  // 编排节点的属性：可以设置id/tag等等
  properties?: Properties;

  /**
   * 转换为X6的图数据格式
   */
  toCells(
    previous?: Node,
    cells?: Cell[],
    options?: Record<string, any>,
  ): Cell[] | Node;
  /**
   * 转换为EL表达式字符串
   */
  toEL(): string;
}

/**
 * EL表达式操作符可以设置的id和tag等等属性。
 */
export interface Properties {
  id?: string;
  tag?: string;
  [key: string]: any;
}
