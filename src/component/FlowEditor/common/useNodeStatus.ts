import { ReactShape } from '@antv/x6-react-shape';
import { IBasicData } from './cellBase';

export const useNodeStatus = (node?: ReactShape): any => {
  const nodeId = node?.id || '';
  const { jobStatus } = node?.getData<IBasicData>() || {};
  return { nodeId, jobStatus };
};
