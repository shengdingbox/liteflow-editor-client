import React from 'react';

import { Graph } from '@antv/x6';
import { RedoOutlined } from '@ant-design/icons';
import { shortcuts } from '../../../common/shortcuts';
import makeBtnWidget from './common/makeBtnWidget';

interface IProps {
  flowGraph: Graph;
}

const Save: React.FC<IProps> = makeBtnWidget({
  tooltip: '重做',
  handler: shortcuts.redo.handler,
  getIcon() {
    return <RedoOutlined />;
  },
  disabled(flowGraph: Graph) {
    return !flowGraph.canRedo();
  },
});

export default Save;
