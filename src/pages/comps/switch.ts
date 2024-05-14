import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/switch-icon.svg';

export const SwitchNode: NodeComp = {
  metadata: {
    label: 'Switch 选择',
    type: 'switch',
    childrenType: 'multiple',
    multipleType: 'switch',
    icon,
  },
};
