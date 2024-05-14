import { LayoutOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import React from 'react';
import { Grapher } from '../../../context/GraphContext';
import makeBtnWidget from './common/makeBtnWidget';
import { forceLayout } from '../../../common/layout';

interface IProps {
  grapher: Grapher;
}

const Edit: React.FC<IProps> = makeBtnWidget({
  tooltip: '自动布局',
  handler(grapher: Grapher) {
    grapher.flowGraph.startBatch('layout');
    forceLayout(grapher.flowGraph);
    grapher.flowGraph.stopBatch('layout');
  },
  getIcon() {
    return <LayoutOutlined />;
  },
  disabled(grapher: Grapher) {
    return false;
  },
});

export default Edit;
