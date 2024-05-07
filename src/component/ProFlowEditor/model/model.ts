import { LiteNodeData, NodeCompStore, NodeData } from '../constant/Comp';

function nodeToCells(
  node: LiteNodeData,
  cells: Array<Record<string, any>>,
  pre?: {
    nodeId?: string;
    edgeLabel?: string;
    port?: string;
  },
): string {
  let preNodeId = pre?.nodeId;
  const comp = NodeCompStore[node.type];
  const curNode = createNode(node);
  cells.push(curNode);
  if (pre?.nodeId) {
    cells.push(
      createEdge(
        pre?.nodeId,
        pre?.port || 'out',
        curNode.id,
        'in',
        pre?.edgeLabel,
      ),
    );
  }

  // children
  if (comp.childrenType === 'then') {
    preNodeId = curNode.id;
    node.children?.forEach((n) => {
      preNodeId = nodeToCells(n, cells, { nodeId: preNodeId });
    });
    return preNodeId;
  } else if (comp.childrenType === 'include') {
    preNodeId = curNode.id;
    node.children?.forEach((n, i) => {
      const port = i === 0 ? 'bottom1' : undefined;
      preNodeId = nodeToCells(n, cells, { nodeId: preNodeId, port });
    });
    cells.push(createEdge(preNodeId, 'out', curNode.id, 'bottom2'));
    return curNode.id;
  } else if (comp.childrenType === 'multiple') {
    const virtualNode = createVirtualNode('LITEFLOW_INTERMEDIATE_END');
    cells.push(virtualNode);
    if (comp.multipleType === 'when' || comp.multipleType === 'switch') {
      node.multiple?.forEach((line) => {
        preNodeId = curNode.id;
        line.children.forEach((n) => {
          preNodeId = nodeToCells(n, cells, { nodeId: preNodeId });
        });
        cells.push(createEdge(preNodeId, 'out', virtualNode.id, 'in'));
      });
      return virtualNode.id;
    } else if (comp.multipleType === 'if') {
      node.multiple?.forEach((line) => {
        preNodeId = curNode.id;
        line.children.forEach((n, i) => {
          const label = i === 0 ? line.name : '';
          preNodeId = nodeToCells(n, cells, {
            nodeId: preNodeId,
            edgeLabel: label,
          });
        });
        cells.push(createEdge(preNodeId, 'out', virtualNode.id, 'in'));
      });
      return virtualNode.id;
    }
  }
  return curNode.id;
}

export function toGraphJson(node: LiteNodeData): any {
  const cells: Array<Record<string, any>> = [];
  const lastNodeId = nodeToCells(node, cells);
  const endNode = createVirtualNode('LITEFLOW_END');
  cells.push(endNode);
  cells.push(createEdge(lastNodeId, 'out', endNode.id, 'in'));

  console.log('===cells', cells);
  return cells;
}

const portGroups = {
  in: {
    position: 'left', // 链接桩位置
    label: {
      position: 'left', // 标签位置
    },
    attrs: {
      circle: {
        r: 6,
        stroke: 'transparent',
        fill: 'transparent',
        // magnet: true,
        // stroke: '#31d0c6',
        // strokeWidth: 2,
        // fill: '#fff',
      },
    },
  },
  out: {
    position: 'right', // 链接桩位置
    label: {
      position: 'right', // 标签位置
    },
    attrs: {
      circle: {
        r: 6,
        stroke: 'transparent',
        fill: 'transparent',
        // magnet: true,
        // stroke: '#31d0c6',
        // strokeWidth: 2,
        // fill: '#fff',
      },
    },
  },
  bottom: {
    position: 'bottom', // 链接桩位置
    label: {
      position: 'bottom', // 标签位置
    },
    attrs: {
      circle: {
        r: 6,
        stroke: 'transparent',
        fill: 'transparent',
        // magnet: true,
        // stroke: '#31d0c6',
        // strokeWidth: 2,
        // fill: '#fff',
      },
    },
  },
};

function createNode(node: NodeData) {
  const comp = NodeCompStore[node.type];
  const ports = {
    groups: portGroups,
    items: [
      {
        id: 'in',
        group: 'in',
        attrs: {
          text: { text: '' },
        },
      },
      {
        id: 'out',
        group: 'out',
        attrs: {
          text: { text: '' },
        },
      },
      {
        id: 'bottom1',
        group: 'bottom',
        attrs: {
          text: { text: '' },
        },
      },
      {
        id: 'bottom2',
        group: 'bottom',
        attrs: {
          text: { text: '' },
        },
      },
    ],
  };
  return {
    view: 'react-shape-view',
    attrs: { label: { text: node.props?.node } },
    shape: comp.shape,
    id: generateNewId(),
    data: null,
    zIndex: 1,
    ports,
  };
}

function createVirtualNode(shape: string) {
  const ports = {
    groups: portGroups,
    items: [
      {
        id: 'in',
        group: 'in',
        attrs: {
          text: { text: '' },
        },
      },
      {
        id: 'out',
        group: 'out',
        attrs: {
          text: { text: '' },
        },
      },
    ],
  };
  return {
    view: 'react-shape-view',
    attrs: { label: { text: '' } },
    shape,
    id: generateNewId(),
    data: null,
    zIndex: 1,
    ports,
  };
}

function createEdge(
  from: string,
  fromPort: string,
  to: string,
  toPort: string,
  label?: string,
) {
  return {
    shape: 'LITEFLOW_EDGE',
    labels: [{ attrs: { label: { text: label } } }],
    id: generateNewId(),
    source: { cell: from, port: fromPort },
    target: { cell: to, port: toPort },
    zIndex: 0,
    router: 'manhattan',
    connector: {
      name: 'rounded',
      args: {},
    },
  };
}

export function generateNewId(): string {
  return Math.random().toString(36).substring(2);
}
