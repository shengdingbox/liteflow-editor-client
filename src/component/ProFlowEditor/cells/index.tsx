import { Graph } from '@antv/x6';
import '@antv/x6-react-shape';
import { NODE_WIDTH, NODE_HEIGHT } from '../constant';
// 开始 & 结束
import { default as Start } from './start';
import { default as End } from './end';
// 顺序：串行、并行
import { default as Common } from './common';
import { default as When } from './when';
import { default as IntermediateEnd } from './intermediate-end';
// 分支：选择、条件
import { default as Switch } from './switch';
import { default as If } from './if';
// 循环
import { default as For } from './for';
import { default as While } from './while';
// 其他辅助节点
import { default as Virtual } from './virtual';

import NodeView from '../components/NodeView';

[
  Start,
  End,
  Common,
  When,
  IntermediateEnd,
  If,
  Switch,
  For,
  While,
  Virtual,
].forEach((cell: any) => {
  // 注册AntV X6节点
  const { type, label, icon, node = {} } = cell;
  Graph.registerNode(type, {
    // primer: 'circle',
    inherit: 'react-shape',
    component(node: any) {
      return <NodeView node={node} icon={icon} />;
    },
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    attrs: {
      label: {
        refX: 0.5,
        refY: '100%',
        refY2: 20,
        text: label,
        fill: '#333',
        fontSize: 13,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        textWrap: {
          width: 80,
          height: 32,
          ellipsis: true,
          breakWord: true,
        },
      },
    },
    ...node,
  });

  Graph.registerReactComponent(type, function component(node: any) {
    return <NodeView node={node} icon={icon} />;
  });
});

export const NODE_GROUP = {
  key: 'node',
  name: '节点类',
  cellTypes: [Virtual],
};

export const SEQUENCE_GROUP = {
  key: 'sequence',
  name: '顺序类',
  cellTypes: [Common, When],
};

export const BRANCH_GROUP = {
  key: 'branch',
  name: '分支类',
  cellTypes: [Switch, If],
};

export const CONTROL_GROUP = {
  key: 'control',
  name: '循环类',
  cellTypes: [For, While],
};
