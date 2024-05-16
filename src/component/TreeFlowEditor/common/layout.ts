import { Edge, Graph, Node } from '@antv/x6';
import { DagreLayout, GridLayout, DagreLayoutOptions } from '@antv/layout';
import { CellPosition, NodeData } from '../types/node';

const rankdir: DagreLayoutOptions['rankdir'] = 'LR';
const align: DagreLayoutOptions['align'] = undefined;
// const align: DagreLayoutOptions['align'] = 'UR';
const nodeSize: number = 30;
const ranksep: number = 20;
const nodesep: number = 20;
const controlPoints: DagreLayoutOptions['controlPoints'] = false;

const X_STEP = 80;
const Y_STEP = 80;

const START_X = 80;
const START_Y = 80;

const forceLDagreayout = (flowGraph: Graph, cfg: any = {}): void => {
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

  const newModel = dagreLayout.layout({
    // @ts-ignore
    nodes: flowGraph.getNodes().map((node) => {
      node.setZIndex(1);
      return node.toJSON();
    }), // @ts-ignore
    edges: flowGraph.getEdges().map((edge) => {
      edge.setZIndex(0);
      // console.log('===old', edge.toJSON());
      return edge.toJSON();
    }),
  });
  flowGraph.fromJSON(newModel);
  // newNodes?.forEach((node: any) => {
  //   const cell: Node | undefined = flowGraph.getCellById(node.id) as
  //     | Node
  //     | undefined;
  //   if (cell) {
  //     cell.position(node.x, node.y);
  //   }
  // });
};

export const forceLayout = (flowGraph: Graph, cfg: any = {}): void => {
  const feimaFlowLayout = new FeimaFlowLayout(flowGraph);
  const newModel = feimaFlowLayout.layout({
    // @ts-ignore
    nodes: flowGraph.getNodes().map((node) => {
      node.setZIndex(1);
      return node.toJSON();
    }), // @ts-ignore
    edges: flowGraph.getEdges().map((edge) => {
      edge.setZIndex(0);
      // console.log('===old', edge.toJSON());
      return edge.toJSON();
    }),
  });
  flowGraph.fromJSON(newModel);
};

interface SimpleNode {
  id: string;
  x: number;
  y: number;
  data: {
    position: CellPosition;
    maxMultipleY?: number; // multiple 节点中最大的 Y 坐标
    [key: string]: any;
  };
}
interface SimpleEdge {
  id: string;
  source: { cell: string; port: string };
  target: { cell: string; port: string };
  vertices?: Array<{ x: number; y: number }>;
}
interface Model {
  nodes: SimpleNode[];
  edges: SimpleEdge[];
}

type NodeAndEdge = [string, string];

interface ModelCache extends Model {
  // key: nodeId, value: nodeId[]
  inMap: Record<string, NodeAndEdge[]>;
  outMap: Record<string, NodeAndEdge[]>;
  bottom1Map: Record<string, NodeAndEdge>;
  bottom2Map: Record<string, NodeAndEdge>;

  // key: nodeId, value: node
  nodeMap: Record<string, SimpleNode>;
  edgeMap: Record<string, SimpleEdge>;
}

class FeimaFlowLayout {
  flowGraph: Graph;

  constructor(flowGraph: Graph) {
    this.flowGraph = flowGraph;
  }

  layout(model: Model): Model {
    const { nodes, edges } = model;
    // 有哪些【节点/边】出来后，进入此节点
    const inMap: Record<string, NodeAndEdge[]> = {};

    // 从此节点出来后，去到了哪些【节点/边】
    const outMap: Record<string, NodeAndEdge[]> = {};

    // 有哪些节点从此节点底部出来
    const bottom1Map: Record<string, NodeAndEdge> = {};

    // 有哪些节点连到从此节点底部
    const bottom2Map: Record<string, NodeAndEdge> = {};

    // key: nodeId, value: node
    const nodeMap: Record<string, SimpleNode> = {};
    const edgeMap: Record<string, SimpleEdge> = {};

    nodes.forEach((n) => {
      nodeMap[n.id] = n;
    });
    edges.forEach((e) => {
      edgeMap[e.id] = e;
    });

    edges.forEach((e) => {
      if (e.source.port === 'out' && e.target.port === 'in') {
        if (outMap[e.source.cell]) {
          outMap[e.source.cell].push([e.target.cell, e.id]);
        } else {
          outMap[e.source.cell] = [[e.target.cell, e.id]];
        }
      } else if (e.source.port === 'bottom1') {
        bottom1Map[e.source.cell] = [e.target.cell, e.id];
      } else if (e.target.port === 'bottom2') {
        bottom2Map[e.target.cell] = [e.source.cell, e.id];
      }

      if (e.target.port === 'in') {
        if (inMap[e.target.cell]) {
          inMap[e.target.cell].push([e.source.cell, e.id]);
        } else {
          inMap[e.target.cell] = [[e.source.cell, e.id]];
        }
      }
    });
    const cache: ModelCache = {
      nodes,
      edges,
      inMap,
      outMap,
      bottom1Map,
      bottom2Map,
      nodeMap,
      edgeMap,
    };

    const firstNode = nodes.find((n) => {
      return !inMap[n.id];
    });
    if (!firstNode) {
      throw new Error('no first node');
    }
    firstNode.x = START_X;
    firstNode.y = START_Y;

    this.setNodePosition(firstNode, cache);
    return this.adjustPosition(model);
  }

  adjustPosition(model: Model): Model {
    // return model;
    const { nodes, edges } = model;
    let minY = Infinity;
    nodes.forEach((n) => {
      minY = Math.min(minY, n.y);
    });
    if (minY < Y_STEP) {
      const addY = Y_STEP - minY;
      nodes.forEach((n) => {
        n.y += addY;
      });
      edges.forEach((e) => {
        e.vertices?.forEach((v) => {
          v.y += addY;
        });
      });
    }
    return model;
  }

  setNodePosition(node: SimpleNode, cache: ModelCache) {
    // in
    const inInfos = this.findIns(node.id, cache);
    if (inInfos.length > 1) {
      let maxX = 0;
      let sumY = 0;
      for (let i = 0; i < inInfos.length; i++) {
        const [inNode] = inInfos[i];
        maxX = Math.max(maxX, inNode.x);
        sumY = sumY + inNode.y;
      }
      node.x = maxX + X_STEP;
      node.y = sumY / inInfos.length;
      for (let i = 0; i < inInfos.length; i++) {
        const [_inNode, inEdge] = inInfos[i];
        const lineY = _inNode.y;
        inEdge.vertices = [
          { x: node.x + nodeSize / 2, y: lineY + nodeSize / 2 },
        ];
      }
    }

    // out
    const outInfos = this.findOuts(node.id, cache);
    if (outInfos.length > 0 && !isNaN(node.x)) {
      for (let i = 0; i < outInfos.length; i++) {
        const [outNode, outEdge] = outInfos[i];
        outNode.x = node.x + X_STEP;
        outNode.y = node.y + Y_STEP * i - (Y_STEP * (outInfos.length - 1)) / 2;

        if (outInfos.length > 1) {
          outEdge.vertices = [
            { x: node.x + nodeSize, y: outNode.y + nodeSize / 2 },
          ];
        }
        this.setNodePosition(outNode, cache);
      }
    }

    // bottom1
    const bottom1Info = this.findBottom1(node.id, cache);
    if (bottom1Info) {
      const [n, e] = bottom1Info;
      n.x = node.x + X_STEP / 2;
      n.y = node.y + Y_STEP * 1.2;
      this.setNodePosition(n, cache);

      e.vertices = [{ x: node.x, y: n.y + nodeSize / 2 }];
    }

    // bottom2
    const bottom2Info = this.findBottom2(node.id, cache);
    if (bottom2Info) {
      const [n, e] = bottom2Info;

      e.vertices = [
        { x: n.x + nodeSize * 2, y: n.y + nodeSize / 2 },
        { x: n.x + nodeSize * 2, y: n.y - nodeSize },
        { x: node.x + nodeSize, y: n.y - nodeSize },
      ];
    }
  }

  findOuts(
    nodeId: string,
    { outMap, nodeMap, edgeMap }: ModelCache,
  ): Array<[SimpleNode, SimpleEdge]> {
    if (!outMap[nodeId]) {
      return [];
    }
    return outMap[nodeId].map(([nodeId, edgeId]) => [
      nodeMap[nodeId],
      edgeMap[edgeId],
    ]);
  }

  findIns(
    nodeId: string,
    { inMap, nodeMap, edgeMap }: ModelCache,
  ): Array<[SimpleNode, SimpleEdge]> {
    if (!inMap[nodeId]) {
      return [];
    }
    return inMap[nodeId].map(([nodeId, edgeId]) => [
      nodeMap[nodeId],
      edgeMap[edgeId],
    ]);
  }

  findBottom1(
    nodeId: string,
    { bottom1Map, nodeMap, edgeMap }: ModelCache,
  ): [SimpleNode, SimpleEdge] | undefined {
    if (!bottom1Map[nodeId]) {
      return undefined;
    }
    const [_nodeId, _edgeId] = bottom1Map[nodeId];
    return [nodeMap[_nodeId], edgeMap[_edgeId]];
  }

  findBottom2(
    nodeId: string,
    { bottom2Map, nodeMap, edgeMap }: ModelCache,
  ): [SimpleNode, SimpleEdge] | undefined {
    if (!bottom2Map[nodeId]) {
      return undefined;
    }
    const [_nodeId, _edgeId] = bottom2Map[nodeId];
    return [nodeMap[_nodeId], edgeMap[_edgeId]];
  }
}
