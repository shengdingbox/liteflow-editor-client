import icon from '../assets/end-icon.svg';
import { NodeComp, NodeData } from '../types/node';
import { generateNewId } from '../utils';

const config: NodeComp = {
  metadata: {
    label: '结束',
    type: 'BUILDIN/END',
    icon,
  },
};

export default config;

export function createEndComp(): NodeData {
  return {
    id: generateNewId(),
    type: 'BUILDIN/END',
  };
}
