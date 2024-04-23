import { LayoutOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import React from 'react';

import makeBtnWidget from './common/makeBtnWidget';
import { forceLayout } from '../../../utils/layout';

interface IProps {
  flowChart: Graph;
}

const Edit: React.FC<IProps> = makeBtnWidget({
  tooltip: '自动布局',
  handler(flowChart: Graph) {
    flowChart.startBatch('layout');
    forceLayout(flowChart);
    flowChart.stopBatch('layout');
  },
  getIcon() {
    return <LayoutOutlined />;
  },
  disabled(flowChart: Graph) {
    return false;
  },
});

export default Edit;
