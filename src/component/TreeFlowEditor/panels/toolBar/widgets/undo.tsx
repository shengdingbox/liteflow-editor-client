import React from 'react';

import { Graph } from '@antv/x6';
import { UndoOutlined } from '@ant-design/icons';
import shortcuts from '../../../common/shortcuts';
import makeBtnWidget from './common/makeBtnWidget';
import { Grapher } from '../../../context/GraphContext';

interface IProps {
  grapher: Grapher;
}

const Save: React.FC<IProps> = makeBtnWidget({
  tooltip: '撤销',
  handler: shortcuts.undo.handler,
  getIcon() {
    return <UndoOutlined />;
  },
  disabled(grapher: Grapher) {
    return grapher.store.pointer === -1;
  },
});

export default Save;
