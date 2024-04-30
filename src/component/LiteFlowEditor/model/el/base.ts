import { Cell } from '@antv/x6';
import ELNode from '../node';
import { ConditionTypeEnum, NodeTypeEnum } from '../../constant';
/**
 * EL表达式操作符基类。
 * 封装缺省的属性和方法，子类可以根据自身情况覆盖相关方法。
 */
export default abstract class BaseOperator implements ELNode {
  type: ConditionTypeEnum | NodeTypeEnum;
  children?: ELNode[];
  constructor(data: ELNode) {
    this.type = data.type;
    this.children = data.children;
  }
  /**
   * 转换为X6的图数据格式
   */
  public abstract toCells(): Cell[];
  /**
   * 转换为EL表达式字符串
   */
  public abstract toEL(): string;
}
