import { Cell } from '@antv/x6';
import ELNode from '../node';
import { NodeTypeEnum } from '../../constant';

export default class NodeOperator implements ELNode {
  type: NodeTypeEnum;
  id: string;

  constructor(type: NodeTypeEnum, id: string) {
    this.type = type;
    this.id = id;
  }

  public toCells(): Cell[] {
    return [];
  }
  public toEL(): string {
    return this.id;
  }
}
