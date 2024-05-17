import { Context, createContext, RefObject } from 'react';
import { Graph } from '@antv/x6';
import { Store } from '../store/Store';
import createFlowChart, { bindKeyboards } from '../graph/createFlowChart';
import { AdvNodeData, NodeComp, NodeData } from '../types/node';
import { autorun } from 'mobx';
import { addPlacehoderNodes, toGraphJson } from '../store/toGraph';
import { forceLayout } from '../common/layout';
import registerEvents from '../common/events';

interface GrapherOpts {
  container: HTMLDivElement;
  miniMapContainer: HTMLDivElement;
  initSchema: NodeData;
  onSave?: (data: NodeData) => Promise<void>;
  compGroups?: Array<[string, NodeComp[]]>;
}

export class Grapher {
  flowGraph!: Graph;
  store!: Store;
  onSave?: (data: NodeData) => Promise<void>;

  constructor(opts?: GrapherOpts) {
    if (!opts) {
      return;
    }
    this.store = new Store(opts.initSchema);
    this.flowGraph = createFlowChart(
      opts.container,
      opts.miniMapContainer,
      opts.compGroups,
    );
    bindKeyboards(this);
    registerEvents(this);

    this.onSave = opts.onSave;
    autorun(() => {
      if (!this.store) {
        return;
      }

      // const advNodeData = addPlacehoderNodes(this.store.document.data);
      this.store.advRootData = addPlacehoderNodes(this.store.document.data);
      const modelJSON = toGraphJson(this.store.advRootData);

      // 显示图形
      this.flowGraph.scroller.disableAutoResize();
      this.flowGraph.startBatch('update');
      this.flowGraph.fromJSON(modelJSON);
      forceLayout(this.flowGraph, this.store.advRootData);
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
