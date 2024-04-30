import { Cell } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ConditionTypeEnum } from '../../constant';

export default class IfOperator implements ELNode {
  type = ConditionTypeEnum.IF;
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
    return `IF(${[
      this.condition.toEL(),
      ...this.children.map((x) => x.toEL()),
    ].join(', ')})`;
  }
}
