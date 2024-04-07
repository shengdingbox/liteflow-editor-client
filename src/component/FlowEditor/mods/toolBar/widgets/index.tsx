import React from 'react';

import { Graph } from '@antv/x6';

import Save from './save';
import Selection from './selection';
import Undo from './undo';
import Redo from './redo';
import Zoom from './zoom';
import FitWindow from './fitWindow';
import View from './view';
import Layout from './layout';

interface IProps {
  flowChart: Graph;
}

const tools: React.FC<IProps>[][] = [
  [Zoom],
  [FitWindow, Undo, Redo, Selection, Save, View, Layout],
];

export default tools;
