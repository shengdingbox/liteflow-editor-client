import {
  Cell,
  // Edge,
  Graph,
  Node,
  // StringExt,
} from '@antv/x6';
import {
  DagreLayout,
  DagreLayoutOptions,
  // Model as LayoutModel,
} from '@antv/layout';

export const hasCellSelected = (flowChart: Graph): boolean => {
  return flowChart.getSelectedCellCount() > 0;
};

export const hasNodeSelected = (flowChart: Graph): boolean => {
  return (
    flowChart.getSelectedCells().filter((cell: Cell) => cell.isNode()).length >
    0
  );
};

export const hasEdgeSelected = (flowChart: Graph): boolean => {
  return (
    flowChart.getSelectedCells().filter((cell: Cell) => cell.isEdge()).length >
    0
  );
};

export const getSelectedNodes = (flowChart: Graph): Cell[] => {
  return flowChart.getSelectedCells().filter((cell: Cell) => cell.isNode());
};

export const getSelectedEdges = (flowChart: Graph): Cell[] => {
  return flowChart.getSelectedCells().filter((cell: Cell) => cell.isEdge());
};

export const toSelectedCellsJSON = (
  flowChart: Graph,
): { cells: Cell.Properties[] } => {
  const json = flowChart.toJSON();
  const selectedCells = flowChart.getSelectedCells();
  return {
    cells: json.cells.filter((cell) =>
      selectedCells.find((o) => o.id === cell.id),
    ),
  };
};

const rankdir: DagreLayoutOptions['rankdir'] = 'LR';
const align: DagreLayoutOptions['align'] = undefined;
const nodeSize: number = 30;
const ranksep: number = 20;
const nodesep: number = 20;
const controlPoints: DagreLayoutOptions['controlPoints'] = false;

export const forceLayout = (flowChart: Graph, cfg: any = {}): void => {
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

  const model = flowChart.toJSON();
  const { nodes: newNodes } = dagreLayout.layout({
    // @ts-ignore
    nodes: model.cells.filter((cell) => cell.shape !== 'edge'), // @ts-ignore
    edges: model.cells.filter((cell) => cell.shape === 'edge'),
  });
  newNodes?.forEach((node: any) => {
    const cell: Node | undefined = flowChart.getCellById(node.id) as
      | Node
      | undefined;
    if (cell) {
      cell.position(node.x, node.y);
    }
  });
};

