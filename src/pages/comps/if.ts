import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/if-icon.svg';

export const IfNode: NodeComp = {
  metadata: {
    label: 'IF 条件',
    type: 'if',
    childrenType: 'branch',
    branchType: 'two',
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
