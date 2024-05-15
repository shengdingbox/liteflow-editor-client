import { NodeComp } from '../../component/TreeFlowEditor/types/node';
import icon from './assets/common-icon.svg';

export const CommonNode: NodeComp = {
  metadata: {
    label: '普通节点',
    type: 'common',
    childrenType: 'then',
    icon,
  },

  defaults: [
    {
      props: { test: 1 },
    },
  ],
};
