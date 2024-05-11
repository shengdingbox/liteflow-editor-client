import React from 'react';

import { Graph } from '@antv/x6';
import makeBtnWidget from './common/makeBtnWidget';
import { FullscreenExitOutlined } from '@ant-design/icons';

interface IProps {
  flowGraph: Graph;
}

const FitWindow: React.FC<IProps> = makeBtnWidget({
  tooltip: '适配窗口',
  getIcon() {
    return <FullscreenExitOutlined />;
  },
  handler(flowGraph: Graph) {
    flowGraph.zoomToFit({ minScale: 0.5, maxScale: 1 });
  },
});

export default FitWindow;
