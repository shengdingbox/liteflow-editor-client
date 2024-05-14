import React from 'react';

import Save from './save';
import Selection from './selection';
import Undo from './undo';
import Redo from './redo';
import Zoom from './zoom';
import FitWindow from './fitWindow';
import View from './view';
import Layout from './layout';
import { Grapher } from '../../../context/GraphContext';

interface IProps {
  grapher: Grapher;
}

const tools: React.FC<IProps>[][] = [
  [Zoom],
  [FitWindow, Undo, Redo, Selection, Save, View, Layout],
];

export default tools;
