import icon from '../assets/start-icon.svg';
import { NodeComp } from '../types/node';

const config: NodeComp = {
  metadata: {
    label: '开始',
    type: 'buildin/start',
    icon,
    childrenType: 'then',
  },
};

export default config;
