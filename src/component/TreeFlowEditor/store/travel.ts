import { NodeData } from '../types/node';

function* travelChildren(nodes: NodeData[]): Generator<NodeData> {
  for (let i = 0; i < nodes.length; i++) {
    yield* travelNode(nodes[i]);
  }
}

export function* travelNode(nodeData: NodeData): Generator<NodeData> {
  yield nodeData;

  if (nodeData.multiple) {
    for (let i = 0; i < nodeData.multiple.length; i++) {
      yield* travelChildren(nodeData.multiple[i].children);
    }
  }

  if (nodeData.children) {
    yield* travelChildren(nodeData.children);
  }
}
