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

[Start, End, Common, MultipleEnd, MultiplePlaceholder].forEach((nodeComp) => {
  // 注册AntV X6节点
  const { type, label, icon } = nodeComp.metadata;
  Graph.registerNode(type, {
    primer: 'circle',
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
    // ...node,
  });

  Graph.registerReactComponent(type, function component(node: any) {
    return <NodeView node={node} icon={icon} />;
  });

  NodeCompStore.registerNode(nodeComp);
});
