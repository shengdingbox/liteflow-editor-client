import React from 'react';

import { Graph } from '@antv/x6';
import makeBtnWidget from './common/makeBtnWidget';
import { Grapher } from '../../../context/GraphContext';
import { FullscreenExitOutlined } from '@ant-design/icons';

interface IProps {
  grapher: Grapher;
}

const FitWindow: React.FC<IProps> = makeBtnWidget({
  tooltip: '适配窗口',
  getIcon() {
    return <FullscreenExitOutlined />;
  },
  handler(grapher: Grapher) {
    grapher.flowGraph.zoomToFit({ minScale: 0.5, maxScale: 1 });
  },
});

export default FitWindow;
