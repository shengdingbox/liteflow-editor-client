import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/switch-icon.svg';

export const SwitchNode: NodeComp = {
  metadata: {
    label: 'Switch 选择',
    type: 'switch',
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
        {
          children: [],
        },
      ],
    },
  ],
};
