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

export function removeNode(root: NodeData, id: string, position: CellPosition) {
  if (position.parent) {
    // 按位置删除
    const nodeInfo = findNode(root, position.parent.id);
    if (position.multiIndex == null) {
      if (position.childrenIndex != null) {
        nodeInfo?.current.children?.splice(position.childrenIndex, 1);
      }
    } else if (position.multiIndex != null) {
      if (position.childrenIndex == null) {
        nodeInfo?.current.multiple?.splice(position.multiIndex, 1);
      } else {
        nodeInfo?.current.multiple?.[position.multiIndex].children?.splice(
          position.childrenIndex,
          1,
        );
      }
    }
  }
}

export function insertNode(
  root: NodeData,
  position: CellPosition,
  node: NodeComp,
) {
  const parentNode = findNode(root, position.parent?.id!)?.current;
  if (parentNode) {
    const newNodeData = {
      type: node.metadata.type,
      id: generateNewId(),
      ...node.defaults?.[0],
    };
    if (position.multiIndex != null && position.childrenIndex != null) {
      parentNode.multiple?.[position.multiIndex].children.splice(
        position.childrenIndex,
        0,
        newNodeData,
      );
    } else if (position.childrenIndex != null) {
      parentNode.children?.splice(position.childrenIndex, 0, newNodeData);
    }
  }
}

export function generateNewId(): string {
  return Math.random().toString(36).substring(2);
}
