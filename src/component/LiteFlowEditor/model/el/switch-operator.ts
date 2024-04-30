import { Cell } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ConditionTypeEnum } from '../../constant';

export default class SwitchOperator implements ELNode {
  type = ConditionTypeEnum.SWITCH;
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
    return `SWITCH(${this.condition.toEL()}).to(${this.children
      .map((x) => x.toEL())
      .join(', ')})`;
  }
}
