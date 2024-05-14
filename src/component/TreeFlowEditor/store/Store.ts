import { makeObservable, action, transaction, autorun } from 'mobx';
import { HistoryStore } from './HistoryStore';
import { NodeComp, NodeData } from '../types/node';
import { deleteNodeById, insertNode, travelNode, travelNode2 } from './travel';

interface DocumentModel {
  data: NodeData;
}

export class Store extends HistoryStore<DocumentModel> {
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
  @action removeNode(id: string) {
    deleteNodeById(this.document.data, id);
  }

  @action insertNode(sourceId: string, targetId: string, node: NodeComp) {
    insertNode(this.document.data, sourceId, targetId, node);
  }
}

export function createStore(initData: NodeData) {
  const store = new Store(initData);
  autorun(() => {
    console.log(store.document.data);
  });
  return store;
}

export function generateNewId(): string {
  return Math.random().toString(36).substring(2);
}
