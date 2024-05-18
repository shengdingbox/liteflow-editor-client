import icon from '../assets/dot-icon.svg';
import { AdvNodeData, NodeComp, NodeData } from '../types/node';
import { generateNewId } from '../utils';

const config: NodeComp = {
  metadata: {
    // label: '节点',
    type: 'NodeVirtualComponent',
    icon,
  },
};

export function createPlaceholderComp(canDelete?: boolean): AdvNodeData {
  return {
    id: generateNewId(),
    type: 'NodeVirtualComponent',
    isVirtual: true,
    canDelete,
  };
}

export default config;
