import { makeObservable, action, transaction, autorun } from 'mobx';
import { HistoryStore } from './HistoryStore';
import { NodeData } from '../types/node';
import { travelNode } from './travel';

interface DocumentModel {
  data: NodeData;
}

export class Store extends HistoryStore<DocumentModel> {
  constructor(initData: NodeData) {
    for (const node of travelNode(initData)) {
      if (!node.id) {
        node.id = generateNewId();
      }
    }
    super({
      data: initData,
    });
    makeObservable(this);
  }

  // just for this example
  @action removeNode(id: string) {
    this.document.data.children?.splice(0, 1);
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
