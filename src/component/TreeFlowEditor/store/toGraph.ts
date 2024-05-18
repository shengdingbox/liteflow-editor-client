import { toJS } from 'mobx';
import { NodeCompStore } from './CompStore';

import { createEndComp } from '../buildinNodes/end';
import { createPlaceholderComp } from '../buildinNodes/multiple-placeholder';
import { AdvNodeData, CellPosition } from '../types/node';
import { generateNewId } from '../utils';
import { travelNode } from './travel';

interface NodeToCellsOpts {
  node: AdvNodeData;
  cells: Array<Record<string, any>>;
  pres?: Array<{
    nodeId?: string;
    edgeLabel?: string;
    port?: string;
  }>;
  position: CellPosition;
}

/**
 * 转换 node，生成 cells
 * @param opts
 * @returns 返回节点的出口 id
 */
function nodeToCells(opts: NodeToCellsOpts): string[] {
  const { node, cells, pres = [], position } = opts;
  const comp = NodeCompStore.getNode(node.type);
  const curNode = createNode(node, position);
  cells.push(curNode);
  for (const pre of pres)
    if (pre.nodeId) {
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
    // for (const pre of pres) {
    // }
    let preNodeIds = [curNode.id];
    node.children?.forEach((n, childrenIndex) => {
      preNodeIds = nodeToCells({
        node: n,
        cells,
        pres: preNodeIds.map((id) => ({ nodeId: id })),
        position: {
          parent: node,
          childrenIndex,
        },
      });
    });
    return preNodeIds;
  } else if (comp.metadata.childrenType === 'include') {
    let preNodeIds = [curNode.id];
    node.children?.forEach((n, childrenIndex) => {
      const port = childrenIndex === 0 ? 'bottom1' : undefined;
      preNodeIds = nodeToCells({
        node: n,
        cells,
        pres: preNodeIds.map((id) => ({ nodeId: id, port })),
        position: {
          parent: node,
          childrenIndex,
        },
      });
    });

    preNodeIds.forEach((preNodeId) => {
      cells.push(
        createEdge({
          from: preNodeId,
          fromPort: 'out',
          to: curNode.id,
          toPort: 'bottom2',
          position: {
            parent: node,
            childrenIndex: node.children!.length,
          },
        }),
      );
    });
    return [curNode.id];
  } else if (comp.metadata.childrenType === 'multiple') {
    const outNodeIds: string[] = [];
    node.multiple?.forEach((line, multiIndex) => {
      let preNodeIds = [curNode.id];
      // if (line.children.length > 0) {
      line.children.forEach((n, childrenIndex) => {
        const label = childrenIndex === 0 ? line.name : undefined;
        preNodeIds = nodeToCells({
          node: n,
          cells,
          pres: preNodeIds.map((id) => ({
            nodeId: id,
            edgeLabel: label,
          })),
          position: {
            parent: node,
            multiIndex,
            childrenIndex,
          },
        });
      });
      outNodeIds.push(...preNodeIds);
    });
    return outNodeIds;
  } else {
    return [curNode.id];
  }
}

export function addPlacehoderNodes(root: AdvNodeData): AdvNodeData {
  const result: AdvNodeData = toJS(root);
  for (const n of travelNode(result)) {
    const cur = n.current as AdvNodeData;
    const comp = NodeCompStore.getNode(cur.type);
    if (comp.metadata.childrenType === 'multiple') {
      cur.multiple!.forEach((m, i) => {
        if (m.children.length == 0) {
          const children = m.children as AdvNodeData[];
          children.push({
            ...createPlaceholderComp(),
            isVirtual: true,
            canDelete: i > 1,
          });
        }
      });
    } else if (comp.metadata.childrenType === 'include') {
      if (cur.children!.length == 0) {
        cur.children!.push(createPlaceholderComp());
      }
    }
  }
  result.children?.push(createEndComp());
  // console.log('====adv', result);
  return result;
}

export function toGraphJson(node: AdvNodeData): any {
  // addPlacehoderNodes(node);
  const cells: Array<Record<string, any>> = [];
  nodeToCells({ node, cells, position: {} });
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

function createNode(node: AdvNodeData, position: CellPosition) {
  // console.log('===create', node.type);
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
  // console.log('=====node.isVirtual', node.isVirtual, node);
  return {
    view: 'react-shape-view',
    attrs: { label: { text: node.props?.node } },
    shape: comp.metadata.type,
    id: node.id || generateNewId(),
    data: {
      toolbar: {
        delete: !node.isVirtual || node.canDelete,
        addMultiple: canAddMultiple,
      },
      nodeComp: comp,
      position,
    },
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
    router: 'manhattan',
    connector: {
      name: 'rounded',
      args: {},
    },
    data: {
      position,
    },
  };
}
