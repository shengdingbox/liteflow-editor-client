import React from 'react';

import { Graph } from '@antv/x6';
import makeBtnWidget from './common/makeBtnWidget';
import { GatewayOutlined } from '@ant-design/icons';

interface IProps {
  flowChart: Graph;
}

const ToggleSelection: React.FC<IProps> = makeBtnWidget({
  tooltip: '框选节点',
  getIcon() {
    return <GatewayOutlined />;
  },
  handler(flowChart: Graph) {
    const needEnableRubberBand: boolean = !flowChart.isRubberbandEnabled();
    if (needEnableRubberBand) {
      flowChart.disablePanning();
      flowChart.enableRubberband();
    } else {
      flowChart.enablePanning();
      flowChart.disableRubberband();
    }
  },
  selected(flowChart: Graph) {
    return flowChart.isRubberbandEnabled();
  },
});

export default ToggleSelection;
