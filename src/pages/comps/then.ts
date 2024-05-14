import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/then-icon.svg';

export const ThenNode: NodeComp = {
  metadata: {
    label: 'Then 串行',
    type: 'then',
    childrenType: 'then',
    icon,
  },

  defaults: [
    {
      props: { test: 1 },
    },
  ],
};
