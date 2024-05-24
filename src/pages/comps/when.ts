import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/when-icon.svg';

export const WhenNode: NodeComp = {
  metadata: {
    label: 'When 并行',
    type: 'when',
    childrenType: 'branch',
    branchType: 'mutable',
    icon,
  },

  defaults: [
    {
      props: { test: 1 },
      branches: [
        {
          children: [],
        },
        {
          children: [],
        },
      ],
    },
  ],
};
