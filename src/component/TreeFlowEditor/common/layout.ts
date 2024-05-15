import { Edge, Graph, Node } from '@antv/x6';
import { DagreLayout, GridLayout, DagreLayoutOptions } from '@antv/layout';

const rankdir: DagreLayoutOptions['rankdir'] = 'LR';
const align: DagreLayoutOptions['align'] = undefined;
// const align: DagreLayoutOptions['align'] = 'UR';
const nodeSize: number = 30;
const ranksep: number = 20;
const nodesep: number = 20;
const controlPoints: DagreLayoutOptions['controlPoints'] = false;

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
  const feimaFlowLayout = new FeimaFlowLayout();
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
  // flowGraph.fromJSON(newModel);
  newModel.nodes?.forEach((node: any) => {
    const cell = flowGraph.getCellById(node.id);
    if (cell) {
      // @ts-ignore
      cell.position(node.x, node.y);
    }
  });
};

const X_STEP = 80;
const Y_STEP = 80;

interface SimpleNode {
  id: string;
  x: number;
  y: number;
}
interface SimpleEdge {
  source: { cell: string; port: string };
  target: { cell: string; port: string };
}
interface Model {
  nodes: SimpleNode[];
  edges: SimpleEdge[];
}

interface ModelCache extends Model {
  // key: nodeId, value: nodeId[]
  inMap: Record<string, string[]>;
  outMap: Record<string, string[]>;
  bottom1Map: Record<string, string[]>;
  // key: nodeId, value: node
  nodeMap: Record<string, SimpleNode>;
}

class FeimaFlowLayout {
  layout(model: Model): Model {
    const { nodes, edges } = model;
    const inMap: Record<string, string[]> = {};
    const outMap: Record<string, string[]> = {};
    const bottom1Map: Record<string, string[]> = {};
    // key: nodeId, value: node
    const nodeMap: Record<string, SimpleNode> = {};
    nodes.forEach((n) => {
      nodeMap[n.id] = n;
    });
    edges.forEach((e) => {
      if (e.source.port === 'out' && e.target.port === 'in') {
        if (outMap[e.source.cell]) {
          outMap[e.source.cell].push(e.target.cell);
        } else {
          outMap[e.source.cell] = [e.target.cell];
        }
      } else if (e.source.port === 'bottom1') {
        if (bottom1Map[e.source.cell]) {
          bottom1Map[e.source.cell].push(e.target.cell);
        } else {
          bottom1Map[e.source.cell] = [e.target.cell];
        }
      }

      if (e.target.port === 'in') {
        if (inMap[e.target.cell]) {
          inMap[e.target.cell].push(e.source.cell);
        } else {
          inMap[e.target.cell] = [e.source.cell];
        }
      }
    });
    const cache: ModelCache = {
      nodes,
      edges,
      inMap,
      outMap,
      bottom1Map,
      nodeMap,
    };

    const firstNode = nodes.find((n) => {
      return !inMap[n.id];
    });
    if (!firstNode) {
      throw new Error('no first node');
    }
    firstNode.x = X_STEP;
    firstNode.y = Y_STEP;

    this.setNodePosition(firstNode, cache);
    return this.adjustPosition(model);
  }

  adjustPosition(model: Model): Model {
    const { nodes } = model;
    let minY = Infinity;
    nodes.forEach((n) => {
      minY = Math.min(minY, n.y);
    });
    if (minY < Y_STEP) {
      const addY = Y_STEP - minY;
      nodes.forEach((n) => {
        n.y += addY;
      });
    }
    return model;
  }

  setNodePosition(node: SimpleNode, cache: ModelCache) {
    // console.log('======', node);
    // in
    const inNodes = this.findIns(node.id, cache);
    if (inNodes.length > 1) {
      let maxX = 0;
      let sumY = 0;
      for (let i = 0; i < inNodes.length; i++) {
        maxX = Math.max(maxX, inNodes[i].x);
        sumY = sumY + inNodes[i].y;
      }
      node.x = maxX + X_STEP;
      node.y = sumY / inNodes.length;
    }

    // bottom1
    const bottom1Node = this.findBottom1(node.id, cache);
    if (bottom1Node) {
      bottom1Node.x = node.x + X_STEP / 2;
      bottom1Node.y = node.y + Y_STEP * 1.2;
      this.setNodePosition(bottom1Node, cache);
    }

    // out
    const outNodes = this.findOuts(node.id, cache);
    if (outNodes.length > 0) {
      for (let i = 0; i < outNodes.length; i++) {
        outNodes[i].x = node.x + X_STEP;
        outNodes[i].y =
          node.y + Y_STEP * i - (Y_STEP * (outNodes.length - 1)) / 2;
        this.setNodePosition(outNodes[i], cache);
      }
    }
  }

  findOuts(nodeId: string, { outMap, nodeMap }: ModelCache): SimpleNode[] {
    if (!outMap[nodeId]) {
      return [];
    }
    return outMap[nodeId].map((id) => nodeMap[id]);
  }

  findIns(nodeId: string, { inMap, nodeMap }: ModelCache): SimpleNode[] {
    if (!inMap[nodeId]) {
      return [];
    }
    return inMap[nodeId].map((id) => nodeMap[id]);
  }

  findBottom1(
    nodeId: string,
    { bottom1Map, nodeMap }: ModelCache,
  ): SimpleNode | undefined {
    if (!bottom1Map[nodeId]) {
      return undefined;
    }
    return bottom1Map[nodeId].map((id) => nodeMap[id])[0];
  }
}
