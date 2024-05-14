import { NodeComp } from '../types/node';

const compMap: Record<string, NodeComp> = {};

export class NodeCompStore {
  static registerNode(node: NodeComp) {
    compMap[node.metadata.type] = node;
  }

  static getNode(type: string) {
    return compMap[type];
  }
}
