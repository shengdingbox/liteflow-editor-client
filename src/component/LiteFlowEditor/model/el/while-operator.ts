import { Cell } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ConditionTypeEnum } from '../../constant';

export default class WhileOperator implements ELNode {
  type = ConditionTypeEnum.WHILE;
  children: ELNode[];
  condition: ELNode;
  properties?: Properties;

  constructor(condition: ELNode, children: ELNode[], properties?: Properties) {
    this.condition = condition;
    this.children = children;
    this.properties = properties;
  }

  public toCells(): Cell[] {
    return [];
  }
  public toEL(): string {
    return `WHILE(${this.condition.toEL()}).DO(${this.children
      .map((x) => x.toEL())
      .join(', ')})`;
  }
}
