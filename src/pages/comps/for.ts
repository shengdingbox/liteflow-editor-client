import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/for-icon.svg';

export const ForNode: NodeComp = {
  metadata: {
    label: 'For 循环',
    type: 'for',
    childrenType: 'include',
    icon,
  },

  defaults: [
    {
      props: { test: 1 },
      children: [],
    },
  ],
};
