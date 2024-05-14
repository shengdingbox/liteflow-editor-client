import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/if-icon.svg';

export const IfNode: NodeComp = {
  metadata: {
    label: 'IF 条件',
    type: 'if',
    childrenType: 'multiple',
    multipleType: 'if',
    icon,
  },
};
