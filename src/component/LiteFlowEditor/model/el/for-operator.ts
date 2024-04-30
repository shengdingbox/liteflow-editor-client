import { Cell } from '@antv/x6';
import BaseOperator from './base';

export default class ForOperator extends BaseOperator {
  public toCells(): Cell[] {
    return [];
  }
  public toEL(): string {
    return '';
  }
}
