import { NODE_TYPE_END } from '../constant';
import icon from '../assets/end-icon.svg';
import { NodeComp } from '../types/node';

const config: NodeComp = {
  metadata: {
    label: '结束',
    type: 'buildin/end',
    icon,
  },
};

export default config;
