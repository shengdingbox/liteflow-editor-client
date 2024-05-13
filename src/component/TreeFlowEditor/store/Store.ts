import { makeObservable, action, transaction, autorun } from 'mobx';
import { HistoryStore } from './HistoryStore';
import { NodeData } from '../types/node';

interface DocumentModel {
  data: NodeData;
}

export class Store extends HistoryStore<DocumentModel> {
  constructor(initData: NodeData) {
    super({
      data: initData,
    });
    makeObservable(this);
  }

  // just for this example
  @action removeNode(id: string) {}
}

export function createStore(initData: NodeData) {
  const store = new Store(initData);
  autorun(() => {
    console.log(store.document.data);
  });
  return store;
}
