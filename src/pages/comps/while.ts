import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/while-icon.svg';

export const WhileNode: NodeComp = {
  metadata: {
    label: 'While 循环',
    type: 'while',
    childrenType: 'include',
    icon,
  },
};
