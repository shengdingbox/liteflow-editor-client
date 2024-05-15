import { CellPosition, NodeComp, NodeData } from '../types/node';

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

export function findNode(
  nodeData: NodeData,
  id: string,
): NodeDataInfo | undefined {
  for (const nodeInfo of travelNode(nodeData)) {
    if (nodeInfo.current.id === id) {
      return nodeInfo;
    }
  }
}

export function deleteNode(root: NodeData, id: string, position: CellPosition) {
  if (position == null) {
    // 按照 id 删除
    const nodeInfo = findNode(root, id);
    const parent = findNode(root, id)?.parent;
    if (nodeInfo && parent) {
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
  } else if (position.parent && position.multiIndex != null) {
    // 按位置删除
    const nodeInfo = findNode(root, position.parent.id);
    nodeInfo?.current.multiple?.splice(position.multiIndex, 1);
  }
}

export function insertNode(
  root: NodeData,
  position: CellPosition,
  node: NodeComp,
) {
  for (const nodeInfo of travelNode(root)) {
    if (nodeInfo.current.id === position.parent?.id) {
      console.log('======find', position, node);
      const newNodeData = {
        type: node.metadata.type,
        id: generateNewId(),
        ...node.defaults?.[0],
      };
      if (position.multiIndex != null && position.childrenIndex != null) {
        nodeInfo.current?.multiple?.[position.multiIndex].children.splice(
          position.childrenIndex,
          0,
          newNodeData,
        );
      } else if (position.childrenIndex != null) {
        nodeInfo.current?.children?.splice(
          position.childrenIndex,
          0,
          newNodeData,
        );
      }
      break;
    }
  }
}

export function generateNewId(): string {
  return Math.random().toString(36).substring(2);
}
