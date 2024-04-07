import { Graph } from '@antv/x6';
import { default as AntiFraud } from './anti-fraud';
import { default as Rule } from './rule';
import { default as Rate } from './rate';
import { default as Limit } from './limit';
import { default as Price } from './price';
import { default as Behavior } from './behavior';
import { default as Switch } from './switch';
import { default as SwitchStart } from './switch-start';
import { default as SwitchEnd } from './switch-end';
import { default as Branch } from './branch';
import { default as End } from './end';
import { default as Start } from './start';
import { default as Parallel } from './parallel';
import { default as Group } from './group';
import { default as Root } from './root';
import { useNodeStatus } from '../useNodeStatus';

export const cellMap: { [key: string]: any } = {};
export const cellSchemaMap: { [key: string]: any } = {};

[
  AntiFraud,
  Rule,
  Rate,
  Limit,
  Price,
  Behavior,
  Switch,
  SwitchStart,
  SwitchEnd,
  Branch,
  End,
  Start,
  Parallel,
  Group,
  Root,
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
  name: '节点类',
  cellTypes: [AntiFraud, Rule, Rate, Limit, Price, Behavior],
};

// Switch.disabled = true;
export const BRANCH_GROUP = {
  key: 'branch',
  name: '分支类',
  cellTypes: [SwitchStart, SwitchEnd],
};

export const CONTROL_GROUP = {
  key: 'control',
  name: '控制类',
  cellTypes: [Start, End, Branch, Parallel],
};
