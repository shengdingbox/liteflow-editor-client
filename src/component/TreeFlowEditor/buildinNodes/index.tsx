import { Graph } from '@antv/x6';
import '@antv/x6-react-shape';
import { NODE_WIDTH, NODE_HEIGHT } from '../constant';
// 开始 & 结束
import { default as Start } from './start';
import { default as End } from './end';
// 顺序：串行、并行
import { default as Common } from './common';
import { default as MultipleEnd } from './multiple-end';
// 分支：选择、条件
// 其他辅助节点
import { default as MultiplePlaceholder } from './multiple-placeholder';

import NodeView from '../components/NodeView';
import { NodeCompStore } from '../constant/Comp';
