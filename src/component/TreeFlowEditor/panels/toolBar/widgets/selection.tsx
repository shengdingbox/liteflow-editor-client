import React from 'react';

import { Graph } from '@antv/x6';
import makeBtnWidget from './common/makeBtnWidget';
import { GatewayOutlined } from '@ant-design/icons';
import { Grapher } from '../../../context/GraphContext';

interface IProps {
  grapher: Grapher;
}

const ToggleSelection: React.FC<IProps> = makeBtnWidget({
  tooltip: '框选节点',
  getIcon() {
    return <GatewayOutlined />;
  },
  handler(grapher: Grapher) {
    const needEnableRubberBand: boolean =
      !grapher.flowGraph.isRubberbandEnabled();
    if (needEnableRubberBand) {
      grapher.flowGraph.disablePanning();
      grapher.flowGraph.enableRubberband();
    } else {
      grapher.flowGraph.enablePanning();
      grapher.flowGraph.disableRubberband();
    }
  },
  selected(grapher: Grapher) {
    return grapher.flowGraph.isRubberbandEnabled();
  },
});

export default ToggleSelection;
