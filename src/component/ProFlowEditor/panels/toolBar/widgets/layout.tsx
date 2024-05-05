import { LayoutOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import React from 'react';

import makeBtnWidget from './common/makeBtnWidget';
import { forceLayout } from '../../../common/layout';

interface IProps {
  flowGraph: Graph;
}

const Edit: React.FC<IProps> = makeBtnWidget({
  tooltip: '自动布局',
  handler(flowGraph: Graph) {
    flowGraph.startBatch('layout');
    forceLayout(flowGraph);
    flowGraph.stopBatch('layout');
  },
  getIcon() {
    return <LayoutOutlined />;
  },
  disabled(flowGraph: Graph) {
    return false;
  },
});

export default Edit;
