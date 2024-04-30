import { ConditionTypeEnum, NodeTypeEnum } from '../constant';

export default interface ELNode {
  type: ConditionTypeEnum | NodeTypeEnum;
  children?: ELNode[];
}
