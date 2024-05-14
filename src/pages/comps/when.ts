import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/when-icon.svg';

export const WhenNode: NodeComp = {
  metadata: {
    label: 'When 并行',
    type: 'when',
    childrenType: 'multiple',
    multipleType: 'when',
    icon,
  },

  defaults: [
    {
      props: { test: 1 },
      multiple: [
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
