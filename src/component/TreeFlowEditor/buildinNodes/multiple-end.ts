import icon from '../assets/intermediate-end-icon.svg';
import { NODE_TYPE_INTERMEDIATE_END } from '../constant';
import { NodeComp } from '../types/node';

const config: NodeComp = {
  metadata: {
    label: '结束',
    type: NODE_TYPE_INTERMEDIATE_END,
    icon,
  },
};

export default config;
