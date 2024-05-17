import { makeObservable, action, transaction, autorun } from 'mobx';
import { HistoryStore } from './HistoryStore';
import { NodeComp, NodeData, CellPosition, AdvNodeData } from '../types/node';
import { removeNode, findNode, insertNode, travelNode } from './travel';
import { Edge } from '@antv/x6';
import { generateNewId } from '../utils';

interface DocumentModel {
  data: NodeData;
}

export class Store extends HistoryStore<DocumentModel> {
  currentEdge?: Edge;
  advRootData?: AdvNodeData;

  constructor(initData: NodeData) {
    for (const nodeInfo of travelNode(initData)) {
      if (!nodeInfo.current.id) {
        nodeInfo.current.id = generateNewId();
      }
    }
    super({
      data: initData,
    });
    makeObservable(this);
  }

  // just for this example
  @action removeNode(id: string, position: CellPosition) {
    removeNode(this.document.data, id, position);
  }

  @action insertNode(position: CellPosition, node: NodeComp) {
    insertNode(this.document.data, position, node);
  }

  @action addMultiple(id: string) {
    const nodeDataInfo = findNode(this.document.data, id)?.current;
    nodeDataInfo?.multiple?.push({ children: [] });
  }
}

export function createStore(initData: NodeData) {
  const store = new Store(initData);
  autorun(() => {
    console.log(store.document.data);
  });
  return store;
}
