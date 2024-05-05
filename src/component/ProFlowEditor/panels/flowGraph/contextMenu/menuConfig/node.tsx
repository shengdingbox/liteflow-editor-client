import React from 'react';

import { CopyOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { Graph } from '@antv/x6';
import shortcuts from '../../../../common/shortcuts';
import { getSelectedNodes } from '../../../../utils/flowChartUtils';

const nodeMenuConfig = [
  {
    key: 'copy',
    title: '复制',
    icon: <CopyOutlined />,
    handler: shortcuts.copy.handler,
  },
  {
    key: 'delete',
    title: '删除',
    icon: <DeleteOutlined />,
    handler: shortcuts.delete.handler,
  },
  {
    key: 'editNode',
    title: '编辑节点',
    icon: <EditOutlined />,
    disabled(flowGraph: Graph) {
      return getSelectedNodes(flowGraph).length !== 1;
    },
    handler(flowGraph: Graph) {
      flowGraph.trigger('graph:editNode');
    },
  },
];

export default nodeMenuConfig;
