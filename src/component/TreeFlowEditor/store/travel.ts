import { NodeComp, NodeData } from '../types/node';

interface NodeDataInfo {
  current: NodeData;
  parent?: NodeData;
  multiIndex?: number;
  childrenIndex?: number;
}

interface TravelChildrenOpts {
  nodes: NodeData[];
  parent?: NodeData;
  multiIndex?: number;
}

function* travelChildren(opts: TravelChildrenOpts): Generator<NodeDataInfo> {
  for (let i = 0; i < opts.nodes.length; i++) {
    yield* travelNodePro({
      current: opts.nodes[i],
      parent: opts.parent,
      multiIndex: opts.multiIndex,
      childrenIndex: i,
    });
  }
}

function* travelNodePro(nodeInfo: NodeDataInfo): Generator<NodeDataInfo> {
  yield nodeInfo;

  const current = nodeInfo.current;

  if (current.multiple) {
    for (let i = 0; i < current.multiple.length; i++) {
      yield* travelChildren({
        nodes: current.multiple[i].children,
        parent: current,
        multiIndex: i,
      });
    }
  }

  if (current.children) {
    yield* travelChildren({
      nodes: current.children,
      parent: current,
    });
  }
}

export function* travelNode(nodeData: NodeData): Generator<NodeDataInfo> {
  yield* travelNodePro({ current: nodeData });
}

export function deleteNodeById(root: NodeData, id: string) {
  for (const nodeInfo of travelNode(root)) {
    if (nodeInfo.current.id === id) {
      const parent = nodeInfo.parent;
      if (parent) {
        if (
          parent.multiple &&
          nodeInfo.multiIndex != null &&
          nodeInfo.childrenIndex != null
        ) {
          parent.multiple[nodeInfo.multiIndex].children.splice(
            nodeInfo.childrenIndex,
            1,
          );
        }
        if (parent.children && nodeInfo.childrenIndex != null) {
          parent.children.splice(nodeInfo.childrenIndex, 1);
        }
      }
      break;
    }
  }
}

export function insertNode(
  root: NodeData,
  sourceId: string,
  targetId: string,
  node: NodeComp,
) {
  for (const nodeInfo of travelNode(root)) {
    if (nodeInfo.current.id === sourceId) {
      if (nodeInfo.parent?.children && nodeInfo.childrenIndex != null) {
        nodeInfo.parent.children.splice(nodeInfo.childrenIndex + 1, 0, {
          type: node.metadata.type,
          id: generateNewId(),
          ...node.defaults?.[0],
        });
      }
      break;
    } else if (nodeInfo.current.id === targetId) {
      if (nodeInfo.parent?.children && nodeInfo.childrenIndex != null) {
        nodeInfo.parent.children.splice(nodeInfo.childrenIndex, 0, {
          type: node.metadata.type,
          id: generateNewId(),
          ...node.defaults?.[0],
        });
      }
      break;
    }
  }
}

export function generateNewId(): string {
  return Math.random().toString(36).substring(2);
}
