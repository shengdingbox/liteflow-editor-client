import { toJS } from 'mobx';
import { NodeCompStore } from './CompStore';

import { createEndComp } from '../buildinNodes/end';
import { createPlaceholderComp } from '../buildinNodes/multiple-placeholder';
import { AdvNodeData, CellPosition, GraphNode } from '../types/node';
import { generateNewId } from '../utils';
import { travelNode } from './travel';

interface NodeToCellsOpts {
  node: AdvNodeData;
  cells: Array<Record<string, any>>;
  pres?: Array<
    GraphNode & {
      edgeLabel?: string;
      port?: string;
    }
  >;
  position: CellPosition;
}

/**
 * 转换 node，生成 cells
 * @param opts
 * @returns 返回节点的出口 id
 */
function nodeToCells(opts: NodeToCellsOpts): GraphNode[] {
  // console.log('===nodeToCells', nodeToCells);
  const { node, cells, pres = [], position } = opts;
  const comp = NodeCompStore.getNode(node.type);

  const curNode = createNode(node, position);
  cells.push(curNode);
  for (const pre of pres) {
    if (pre.id) {
      // console.log('===position', position, node);
      cells.push(
        createEdge({
          from: pre?.id,
          fromPort: pre.data.isVirtual ? 'center' : pre?.port || 'out',
          to: curNode.id,
          toPort: curNode.data.isVirtual ? 'center' : 'in',
          label: pre?.edgeLabel,
          position:
            pres.length > 1
              ? {
                  ...pre.data.position,
                  childrenIndex: pre.data.position.childrenIndex! + 1,
                }
              : position,
          // toVirtualNode: curNode.data.isVirtual,
        }),
      );
    }
  }

  // children
  if (comp.metadata.childrenType === 'then') {
    let preNodes = [curNode];
    let virtualCount = 0;
    node.children?.forEach((n, childrenIndex) => {
      if (n.type === 'NodeVirtualComponent') {
        virtualCount++;
      }
      preNodes = nodeToCells({
        node: n,
        cells,
        pres: preNodes,
        position: {
          parent: node,
          childrenIndex: Math.max(0, childrenIndex - virtualCount),
        },
      });
    });
    return preNodes;
  } else if (comp.metadata.childrenType === 'include') {
    let preNodes = [curNode];
    let virtualCount = 0;
    node.children?.forEach((n, childrenIndex) => {
      const port = childrenIndex === 0 ? 'bottom1' : undefined;
      if (n.type === 'NodeVirtualComponent') {
        virtualCount++;
      }
      preNodes = nodeToCells({
        node: n,
        cells,
        pres: preNodes.map((node) => ({ ...node, port })),
        position: {
          parent: node,
          childrenIndex: Math.max(0, childrenIndex - virtualCount),
        },
      });
    });

    preNodes.forEach((preNode) => {
      cells.push(
        createEdge({
          from: preNode.id,
          fromPort: preNode.data.isVirtual ? 'center' : 'out',
          to: curNode.id,
          toPort: 'bottom2',
          position: {
            parent: node,
            childrenIndex: node.children!.length,
          },
        }),
      );
    });
    return [curNode];
  } else if (comp.metadata.childrenType === 'multiple') {
    const outNodes: GraphNode[] = [];
    node.multiple?.forEach((line, multiIndex) => {
      let preNodes = [curNode];
      let virtualCount = 0;
      line.children.forEach((n: AdvNodeData, childrenIndex) => {
        const label = childrenIndex === 0 ? line.name : undefined;
        if (n.type === 'NodeVirtualComponent') {
          virtualCount++;
        }
        preNodes = nodeToCells({
          node: n,
          cells,
          pres: preNodes.map((node) => ({
            ...node,
            edgeLabel: label,
          })),
          position: {
            parent: node,
            multiIndex,
            childrenIndex: Math.max(0, childrenIndex - virtualCount),
          },
        });
      });
      outNodes.push(...preNodes);
    });
    return outNodes;
  } else {
    return [curNode];
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
          children.push(createPlaceholderComp(cur.multiple!?.length > 2));
        }
      });
      const curParent = n.parent;
      if (curParent) {
        const parentComp = NodeCompStore.getNode(curParent.type);
        if (parentComp.metadata.childrenType === 'multiple') {
          const children = curParent.multiple![n.multiIndex!].children;
          children.splice(n.childrenIndex! + 1, 0, createPlaceholderComp());
        } else if (parentComp.metadata.childrenType === 'then') {
          const children = curParent.children!;
          children.splice(n.childrenIndex! + 1, 0, createPlaceholderComp());
        } else if (parentComp.metadata.childrenType === 'include') {
          const children = curParent.children!;
          children.splice(n.childrenIndex! + 1, 0, createPlaceholderComp());
        }
      }
    } else if (comp.metadata.childrenType === 'include') {
      if (cur.children!.length == 0) {
        const children = cur.children!;
        children.push(createPlaceholderComp());
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

function createNode(node: AdvNodeData, position: CellPosition): GraphNode {
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
      {
        id: 'center',
        group: 'center',
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
      isVirtual: node.isVirtual,
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
  toVirtualNode?: boolean;
}

function createEdge(opts: EdgeOpts) {
  const { from, fromPort, to, toPort, label, position, toVirtualNode } = opts;
  return {
    shape: toVirtualNode ? 'FLOW_EDGE_TO_VIRTUAL' : 'FLOW_EDGE',
    labels: [{ attrs: { label: { text: label, color: '#666' } } }],
    id: generateNewId(),
    source: { cell: from, port: fromPort },
    target: { cell: to, port: toPort },
    zIndex: 0,
    // router: 'er',
    connector: {
      name: 'rounded',
      args: {},
    },
    data: {
      position,
    },
  };
}
