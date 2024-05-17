import icon from '../assets/dot-icon.svg';
import { NodeComp, NodeData } from '../types/node';
import { generateNewId } from '../utils';

const config: NodeComp = {
  metadata: {
    label: '节点',
    type: 'NodeVirtualComponent',
    icon,
  },
};

export function createPlaceholderComp(): NodeData {
  return {
    id: generateNewId(),
    type: 'NodeVirtualComponent',
  };
}

export default config;
