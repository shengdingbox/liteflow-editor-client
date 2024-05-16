import { NodeCompStore } from './CompStore';
import { CellPosition, NodeData } from '../types/node';

interface NodeToCellsOpts {
  node: NodeData;
  cells: Array<Record<string, any>>;
  pre?: {
    nodeId?: string;
    edgeLabel?: string;
    port?: string;
  };
  position: CellPosition;
}

/**
 * 转换 node，生成 cells
 * @param opts
 * @returns 返回节点的 id
 */
function nodeToCells(opts: NodeToCellsOpts): string {
  const { node, cells, pre, position } = opts;
  let preNodeId = pre?.nodeId;
  const comp = NodeCompStore.getNode(node.type);
  const curNode = pre
    ? createNode(node, position)
    : createStartEndNode('start');
  cells.push(curNode);
  if (pre?.nodeId) {
    cells.push(
      createEdge({
        from: pre?.nodeId,
        fromPort: pre?.port || 'out',
        to: curNode.id,
        toPort: 'in',
        label: pre?.edgeLabel,
        position,
      }),
    );
  }

  // children
  if (comp.metadata.childrenType === 'then') {
    preNodeId = curNode.id;
    node.children?.forEach((n, childrenIndex) => {
      preNodeId = nodeToCells({
        node: n,
        cells,
        pre: { nodeId: preNodeId },
        position: {
          parent: node,
          childrenIndex,
        },
      });
    });
    return preNodeId;
  } else if (comp.metadata.childrenType === 'include') {
    preNodeId = curNode.id;
    if (node.children!?.length > 0) {
      node.children?.forEach((n, childrenIndex) => {
        const port = childrenIndex === 0 ? 'bottom1' : undefined;
        preNodeId = nodeToCells({
          node: n,
          cells,
          pre: { nodeId: preNodeId, port },
          position: {
            parent: node,
            childrenIndex,
          },
        });
      });
    } else {
      const emptyNode = createVirtualNode({ parent: node, childrenIndex: 0 });
      cells.push(emptyNode);
      cells.push(
        createEdge({
          from: preNodeId,
          fromPort: 'bottom1',
          to: emptyNode.id,
          toPort: 'in',
          position: {
            parent: node,
            childrenIndex: 0,
          },
          withoutArrow: true,
        }),
      );
      preNodeId = emptyNode.id;
    }
    cells.push(
      createEdge({
        from: preNodeId,
        fromPort: 'out',
        to: curNode.id,
        toPort: 'bottom2',
        position: {
          parent: node,
          childrenIndex:
            node.children && node.children.length > 0
              ? node.children.length
              : 0,
        },
      }),
    );
    return curNode.id;
  } else if (comp.metadata.childrenType === 'multiple') {
    // 最后的汇合点
    const virtualNode = createVirtualNode({ parent: node });
    cells.push(virtualNode);

    node.multiple?.forEach((line, multiIndex) => {
      preNodeId = curNode.id;
      if (line.children.length > 0) {
        line.children.forEach((n, childrenIndex) => {
          const label = childrenIndex === 0 ? line.name : undefined;
          preNodeId = nodeToCells({
            node: n,
            cells,
            pre: {
              nodeId: preNodeId,
              edgeLabel: label,
            },
            position: {
              parent: node,
              multiIndex,
              childrenIndex,
            },
          });
        });
      } else {
        const emptyNode = createVirtualNode(
          { parent: node, multiIndex },
          multiIndex > 1,
        );
        cells.push(emptyNode);
        cells.push(
          createEdge({
            from: preNodeId,
            fromPort: 'out',
            to: emptyNode.id,
            toPort: 'in',
            label: line.name,
            position: {
              parent: node,
              multiIndex,
              childrenIndex: 0,
            },
            withoutArrow: true,
          }),
        );
        preNodeId = emptyNode.id;
      }
      const childrenIndex =
        line.children && line.children.length > 0 ? line.children.length : 0;
      cells.push(
        createEdge({
          from: preNodeId,
          fromPort: 'out',
          to: virtualNode.id,
          toPort: 'in',
          position: {
            parent: node,
            multiIndex,
            childrenIndex,
          },
          withoutArrow: true,
        }),
      );
    });
    return virtualNode.id;
  } else {
    return curNode.id;
  }
}

export function toGraphJson(node: NodeData): any {
  const cells: Array<Record<string, any>> = [];
  const lastNodeId = nodeToCells({ node, cells, position: {} });
  const endNode = createStartEndNode('end');
  cells.push(endNode);
  cells.push(
    createEdge({
      from: lastNodeId,
      fromPort: 'out',
      to: endNode.id,
      toPort: 'in',
      position: {
        parent: node,
        childrenIndex: node.children?.length,
      },
    }),
  );

  // console.log('===cells', cells);
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
  bottom1: {
    position: {
      name: 'absolute',
      args: {
        x: 0,
        y: 30,
      },
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
  bottom2: {
    position: {
      name: 'absolute',
      args: {
        x: 30,
        y: 30,
      },
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
  center: {
    position: {
      name: 'absolute',
      args: {
        x: 15,
        y: 15,
      },
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

function createNode(node: NodeData, position: CellPosition) {
  const comp = NodeCompStore.getNode(node.type);
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
        group: 'bottom1',
        attrs: {
          text: { text: '' },
        },
      },
      {
        id: 'bottom2',
        group: 'bottom2',
        attrs: {
          text: { text: '' },
        },
      },
    ],
  };
  const canAddMultiple = comp.metadata.multipleType === 'mutable';
  return {
    view: 'react-shape-view',
    attrs: { label: { text: node.props?.node } },
    shape: comp.metadata.type,
    id: node.id || generateNewId(),
    data: {
      toolbar: {
        delete: true,
        addMultiple: canAddMultiple,
      },
      nodeComp: comp,
      position,
    },
    zIndex: 1,
    ports,
  };
}

function createVirtualNode(position: CellPosition, canDelete?: boolean) {
  // const canDelete = !!(
  //   deletePosition?.multiIndex && deletePosition.multiIndex > 1
  // );
  const ports = {
    groups: portGroups,
    items: [
      {
        id: 'in',
        group: 'center',
      },
      {
        id: 'out',
        group: 'center',
      },
    ],
  };
  return {
    view: 'react-shape-view',
    attrs: { label: { text: '' } },
    shape: 'NodeVirtualComponent',
    id: generateNewId(),
    data: {
      toolbar: { delete: canDelete },
      position,
    },
    zIndex: 1,
    ports,
  };
}

function createStartEndNode(type: 'start' | 'end') {
  const ports = {
    groups: portGroups,
    items: [
      {
        id: 'in',
        group: 'in',
      },
      {
        id: 'out',
        group: 'out',
      },
    ],
  };
  return {
    view: 'react-shape-view',
    attrs: { label: { text: '' } },
    shape: type === 'start' ? 'BUILDIN/START' : 'BUILDIN/END',
    id: generateNewId(),
    data: null,
    zIndex: 1,
    ports,
  };
}

interface EdgeOpts {
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
  label?: string;
  position: CellPosition;
  withoutArrow?: boolean;
}

function createEdge(opts: EdgeOpts) {
  const { from, fromPort, to, toPort, label, position, withoutArrow } = opts;
  return {
    shape: withoutArrow ? 'FLOW_EDGE_NOARROW' : 'FLOW_EDGE',
    labels: [{ attrs: { label: { text: label, color: '#666' } } }],
    id: generateNewId(),
    source: { cell: from, port: fromPort },
    target: { cell: to, port: toPort },
    zIndex: 0,
    // router: 'manhattan',
    connector: {
      name: 'rounded',
      args: {},
    },
    data: {
      position,
    },
  };
}

export function generateNewId(): string {
  return Math.random().toString(36).substring(2);
}
