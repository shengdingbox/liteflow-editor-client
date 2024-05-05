import { Graph, Node } from '@antv/x6';
import { DagreLayout, DagreLayoutOptions } from '@antv/layout';

const rankdir: DagreLayoutOptions['rankdir'] = 'LR';
const align: DagreLayoutOptions['align'] = undefined;
const nodeSize: number = 30;
const ranksep: number = 20;
const nodesep: number = 20;
const controlPoints: DagreLayoutOptions['controlPoints'] = false;

export const forceLayout = (flowGraph: Graph, cfg: any = {}): void => {
  const dagreLayout: DagreLayout = new DagreLayout({
    begin: [40, 40],
    type: 'dagre',
    rankdir,
    align,
    nodeSize,
    ranksep,
    nodesep,
    controlPoints,
  });

  dagreLayout.updateCfg({
    // ranker: 'tight-tree', // 'tight-tree' 'longest-path' 'network-simplex'
    // nodeOrder,
    // preset: {
    //   nodes: model.nodes.filter((node: any) => node._order !== undefined),
    // },
    ...cfg,
  });

  const { nodes: newNodes } = dagreLayout.layout({
    // @ts-ignore
    nodes: flowGraph.getNodes().map((node) => {
      node.setZIndex(1);
      return node.toJSON();
    }), // @ts-ignore
    edges: flowGraph.getEdges().map((edge) => {
      edge.setZIndex(0);
      return edge.toJSON();
    }),
  });
  newNodes?.forEach((node: any) => {
    const cell: Node | undefined = flowGraph.getCellById(node.id) as
      | Node
      | undefined;
    if (cell) {
      cell.position(node.x, node.y);
    }
  });
};
