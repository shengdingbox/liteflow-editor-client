import { Cell } from '@antv/x6';
import ELNode from './node';
import { ConditionTypeEnum } from '../constant';

/**
 * EL表达式的根节点。
 */
export default class Chain implements ELNode {
  type = ConditionTypeEnum.CHAIN;
  children: ELNode[] = [];
  constructor(children: ELNode[]) {
    this.children = children;
  }

  /**
   * 转换为X6的图数据格式
   */
  public toCells(): Cell[] {
    return [];
  }

  /**
   * 转换为EL表达式字符串
   */
  public toEL(): string {
    return this.children.map((x) => x.toEL()).join(', ');
  }
}
