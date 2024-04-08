import { Graph } from '@antv/x6';
// 开始 & 结束
import { default as Start } from './start';
import { default as End } from './end';
// 顺序：串行、并行
import { default as Common } from './common';
import { default as ParallelStart } from './parallel-start';
import { default as ParallelEnd } from './parallel-end';
// 分支：选择、条件
import { default as Switch } from './switch';
import { default as Branch } from './branch';
// 循环：TODO
import { useNodeStatus } from '../useNodeStatus';

export const cellMap: { [key: string]: any } = {};
export const cellSchemaMap: { [key: string]: any } = {};

[
  Common,
  ParallelStart,
  ParallelEnd,
  Branch,
  End,
  Start,
  Switch
].forEach((cell) => {
  // 注册AntV X6节点
  const { meta, node, view: View } = cell;
  const StatusView = function ({ node }: any) {
    const nodeStatus = useNodeStatus(node);
    return <View node={node} status={nodeStatus} />;
  };
  Graph.registerNode(meta.type, node);
  Graph.registerReactComponent(meta.type, (node: any) => {
    return <StatusView node={node} />;
  });

  // 映射视图/节点
  cellMap[meta.type] = View;
  cellSchemaMap[meta.type] = node;
});

export const NODE_GROUP = {
  key: 'node',
  name: '顺序类',
  cellTypes: [Common, ParallelStart],
};

// Switch.disabled = true;
export const BRANCH_GROUP = {
  key: 'branch',
  name: '分支类',
  cellTypes: [Switch, Branch],
};

export const CONTROL_GROUP = {
  key: 'control',
  name: '循环类',
  cellTypes: [],
};
