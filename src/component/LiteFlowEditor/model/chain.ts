import { Cell } from '@antv/x6';
import ELNode from './node';

export default class Chain {
  children: ELNode[] = [];
  constructor(children: ELNode[]) {
    this.children = children;
  }
  public toCells(): Cell[] {
    return [];
  }
  public toEL(): string {
    return '';
  }
}
