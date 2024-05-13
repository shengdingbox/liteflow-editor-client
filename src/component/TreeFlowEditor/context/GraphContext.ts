import { Context, createContext, RefObject } from 'react';
import { Graph } from '@antv/x6';
import { Store } from '../store/Store';
import createFlowChart from '../graph/createFlowChart';
import { NodeData } from '../types/node';
import { autorun } from 'mobx';
import { toGraphJson } from '../model/model';
import { forceLayout } from '../common/layout';

export class Grapher {
  flowGraph!: Graph;
  store!: Store;

  constructor();
  constructor(
    container: HTMLDivElement,
    miniMapContainer: HTMLDivElement,
    initSchema: NodeData,
  );
  constructor(
    container?: HTMLDivElement,
    miniMapContainer?: HTMLDivElement,
    initSchema?: NodeData,
  ) {
    if (!container || !miniMapContainer || !initSchema) {
      return;
    }
    this.store = new Store(initSchema);
    this.flowGraph = createFlowChart(container, miniMapContainer, this.store);
    autorun(() => {
      if (!this.store) {
        return;
      }

      const modelJSON = toGraphJson(this.store.document.data);

      // 显示图形
      this.flowGraph.scroller.disableAutoResize();
      this.flowGraph.startBatch('update');
      this.flowGraph.fromJSON(modelJSON);
      forceLayout(this.flowGraph);
      this.flowGraph.stopBatch('update');
      this.flowGraph.scroller.enableAutoResize();
    });
  }

  isReady() {
    return !!(this.flowGraph && this.store);
  }
}

export const GraphContext: Context<Grapher> = createContext(new Grapher());

export default GraphContext;
