import { RedoOutlined } from '@ant-design/icons';
import React from 'react';

import shortcuts from '../../../common/shortcuts';
import { Grapher } from '../../../context/GraphContext';
import makeBtnWidget from './common/makeBtnWidget';

interface IProps {
  grapher: Grapher;
}

const Save: React.FC<IProps> = makeBtnWidget({
  tooltip: '重做',
  handler: shortcuts.redo.handler,
  getIcon() {
    return <RedoOutlined />;
  },
  disabled(grapher: Grapher) {
    const store = grapher.store;
    return store.stack.length === store.pointer + 1;
  },
});

export default Save;
