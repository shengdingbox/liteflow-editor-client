import {
  Cell,
  Edge,
  // Edge,
  Graph,
  Node,
  // StringExt,
} from '@antv/x6';
import {
  DagreLayout,
  DagreLayoutOptions,
  OutNode,
  // Model as LayoutModel,
} from '@antv/layout';
import GroupNode from '../common/cells/group';
import StartNode from '../common/cells/start';
import RootNode from '../common/cells/root';
import SwitchStartNode from '../common/cells/switch-start';
import SwitchEndNode from '../common/cells/switch-end';
import { KeyValue } from '@antv/x6/lib/types';
import FlowChart from '../mods/flowChart';

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
const align: DagreLayoutOptions['align'] = 'UL';
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

export const dagreLayout = (flowChart: Graph): void => {
  const dagreLayout: DagreLayout = new DagreLayout({
    type: 'dagre',
    rankdir,
    align,
    nodeSize,
    ranksep,
    nodesep,
    controlPoints,
  });

  const nodeCells: Node<Node.Properties>[] = flowChart.getNodes();

  const groupNodes: Node<Node.Properties>[] = nodeCells.filter(
    (node: Node<Node.Properties>) => {
      return node.shape === GroupNode.meta.type;
    },
  );

  // 使用分治法、进行多次排序
  // 1. 对于根节点和各个分组节点，当做一个子图，进行一次Dagre排序
  // @ts-expect-error
  const rootNode: Node<Node.Properties> = nodeCells.find(
    (node: any) => node.shape === RootNode.meta.type,
  );
  const rootSubGraphCells: Cell<Cell.Properties>[] = flowChart.getSubGraph([
    rootNode,
    ...groupNodes,
  ]);
  const { nodes: newNodes } = dagreLayout.layout({
    nodes: rootSubGraphCells
      .filter((cell: Cell<Cell.Properties>) => cell.isNode())
      .map((cell: Cell<Cell.Properties>) => cell.toJSON()) as any[],
    edges: rootSubGraphCells
      .filter((cell: Cell<Cell.Properties>) => cell.isEdge())
      .map((cell: Cell<Cell.Properties>) => cell.toJSON()) as any[],
  });
  let prevY = 0;
  newNodes?.forEach((node: any) => {
    const cell: Node | undefined = flowChart.getCellById(node.id) as
      | Node
      | undefined;
    if (cell) {
      cell.position(node.x, node.y + prevY);
      prevY += cell.getSize().height - nodeSize;
    }
  });

  // 2. 对分组内的各个节点，当做一个子图，分别进行Dagre排序
  dagreLayout.updateCfg({
    nodeSize: undefined,
  });
  groupNodes.forEach((groupNode: Node<Node.Properties>) => {
    const groupSubGraphCells: Cell<Cell.Properties>[] = flowChart.getSubGraph(
      groupNode.getDescendants(),
    );
    const groupSubGraphNodes = groupSubGraphCells.filter(
      (cell: Cell<Cell.Properties>) => cell.isNode(),
    ) as Node[];
    const groupSubGraphEdges = groupSubGraphCells.filter(
      (cell: Cell<Cell.Properties>) => cell.isEdge(),
    ) as Edge[];

    const groupPosition = groupNode.position();
    const nodeOrder = getNodeOrderFrom(
      flowChart,
      groupSubGraphNodes,
      groupSubGraphEdges,
    );
    const model = {
      nodes: groupSubGraphNodes.map((cell: Cell<Cell.Properties>) =>
        cell.toJSON(),
      ) as any[],
      edges: groupSubGraphEdges.map((cell: Cell<Cell.Properties>) =>
        cell.toJSON(),
      ) as any[],
    };
    dagreLayout.updateCfg({
      begin: [groupPosition.x + 65, groupPosition.y + 85],
      // ranker: 'tight-tree', // 'tight-tree' 'longest-path' 'network-simplex'
      nodeOrder,
      preset: {
        nodes: model.nodes.filter((node: any) => node._order !== undefined),
      },
    });

    let { nodes: newNodes = [] } = dagreLayout.layout(model);

    nodeOrder.forEach((nodeId: string) => {
      const newNode: OutNode | undefined = newNodes.find(
        (node: any) => node.id === nodeId,
      ) as OutNode | undefined;
      const current: Node | undefined =
        newNode && (flowChart.getCellById(newNode.id) as Node | undefined);
      if (newNode && current) {
        // const fitPosition = getFitPosition(flowChart, current, newNode);
        const newPosition = getNewPosition(flowChart, current, newNode);
        current.position(newPosition.x, newPosition.y);
        // current.prop('_order', newNode._order);
      }
    });
  });
};

function getNodeOrderFrom(
  flowChart: Graph,
  groupSubGraphNodes: Node[],
  groupSubGraphEdges: Edge[],
): string[] {
  const nodeOrder: string[] = [];

  const rootNode: Node | undefined = groupSubGraphNodes.find(
    (node: any) => node.shape === StartNode.meta.type,
  );
  if (rootNode) {
    let queue: Node[] = [];
    const visited: KeyValue<boolean> = {};
    queue.push(rootNode);

    while (queue.length > 0) {
      const next = queue.pop();
      if (next == null || visited[next.id]) {
        continue;
      }
      visited[next.id] = true;
      nodeOrder.push(next.id);

      const neighbors = flowChart.getNeighbors(next, {
        outgoing: true,
      }) as Node[];
      neighbors.sort((a: Node, b: Node) => {
        const { y: aY } = a.position();
        const { y: bY } = b.position();
        return aY - bY;
      });
      const lastIndex = queue.length;
      neighbors.forEach((neighbor) => {
        queue.splice(lastIndex, 0, neighbor);
      });
    }
  }

  return nodeOrder;
}

function getNewPosition(flowChart: Graph, current: Node, newNode: OutNode) {
  let newPosition: Record<string, number> = {
    x: newNode.x,
    y: newNode.y,
  };

  if (isSwitchGroupHasDirectEdge(flowChart, current, newNode)) {
    newPosition = getFitPosition(flowChart, current, newNode);
  }

  return newPosition;
}

// 分组有StartNode/EndNode直接连接的边，需要进行特殊处理
function isSwitchGroupHasDirectEdge(
  flowChart: Graph,
  current: Node,
  newNode: OutNode,
) {
  const predecessors = flowChart.getPredecessors(current) as Node[];
  const preSwitchStart = predecessors
    .filter((node: Node) => node.shape === SwitchStartNode.meta.type)
    .sort((a: Node, b: Node) => a.position().x - b.position().x)[0];

  const successors = flowChart.getSuccessors(current) as Node[];
  const postSwitchEnd = successors
    .filter((node: Node) => node.shape === SwitchEndNode.meta.type)
    .sort((a: Node, b: Node) => a.position().x - b.position().x)[0];

  if (preSwitchStart && postSwitchEnd) {
    for (const edge of flowChart.getEdges()) {
      if (
        edge.getSourceCellId() === preSwitchStart.id &&
        edge.getTargetCellId() === postSwitchEnd.id
      ) {
        return true;
      }
    }
  }

  return false;
}

function getFitPosition(flowChart: Graph, current: Node, newNode: OutNode) {
  const currentPosition = current.getPosition();
  const fitPosition: Record<string, number> = {
    x: newNode.x,
    y: currentPosition.y,
  };
  const incomingNeighborPosition = getIncomingNeighborPosition(
    flowChart,
    current,
    newNode,
  );

  // 根据节点的输入边和输出边判断向上偏移还是向下偏移
  let hasTopSource = false;
  let hasBottomSource = false;
  let hasTopTarget = false;
  let hasBottomTarget = false;

  const incomingEdges = flowChart.getIncomingEdges(current);
  const outgoingEdges = flowChart.getOutgoingEdges(current);
  if (incomingEdges) {
    for (let i = 0; i < incomingEdges.length; i++) {
      const sourceInfo: any = incomingEdges[i].getSource();
      // 只要有一个边是top或者bottom就可以结束循环
      if (sourceInfo.port === 'top') {
        hasTopSource = true;
        break;
      }
      if (sourceInfo.port === 'bottom') {
        hasBottomSource = true;
        break;
      }
    }
  }

  if (outgoingEdges) {
    for (let i = 0; i < outgoingEdges.length; i++) {
      const targetInfo: any = outgoingEdges[i].getTarget();
      if (targetInfo.port === 'top') {
        hasTopTarget = true;
        break;
      }
      if (targetInfo.port === 'bottom') {
        hasBottomTarget = true;
        break;
      }
    }
  }

  if (hasTopSource && hasTopTarget) {
    fitPosition.y = incomingNeighborPosition.y - nodeSize - nodesep - ranksep;
  } else if (hasBottomSource && hasBottomTarget) {
    fitPosition.y = incomingNeighborPosition.y + nodeSize + nodesep + ranksep;
  }

  return fitPosition;
}

// 获取左侧邻居节点的位置
function getIncomingNeighborPosition(
  flowChart: Graph,
  current: Node,
  newNode: OutNode,
) {
  const neighbors = flowChart.getNeighbors(current, {
    incoming: true,
  }) as Node[];
  neighbors.sort((a: Node, b: Node) => {
    const { y: aY } = a.position();
    const { y: bY } = b.position();
    return aY - bY;
  });
  const incomingNeighborPosition = neighbors[0]?.getPosition();
  return incomingNeighborPosition;
}
