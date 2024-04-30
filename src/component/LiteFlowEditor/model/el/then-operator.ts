import { Cell } from '@antv/x6';
import ELNode, { Properties } from '../node';
import { ConditionTypeEnum } from '../../constant';

export default class ThenOperator implements ELNode {
  type = ConditionTypeEnum.THEN;
  children: ELNode[];
  properties?: Properties;

  constructor(children: ELNode[], properties?: Properties) {
    this.children = children;
    this.properties = properties;
  }

  public toCells(): Cell[] {
    return [];
  }
  public toEL(): string {
    return `THEN(${this.children.map((x) => x.toEL()).join(', ')})`;
  }
}
