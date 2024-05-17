import { DagreLayoutOptions } from '@antv/layout';
import { Graph } from '@antv/x6';
import { toJS } from 'mobx';

import { AdvNodeData, CellPosition, NodeData } from '../types/node';
import { NodeCompStore } from '../store/CompStore';
import { NODE_HEIGHT, NODE_WIDTH } from '../constant';
import { travelNode } from '../store/travel';

const nodeSize: number = 30;

const X_STEP = 80;
const Y_STEP = 80;

export const forceLayout = (
  flowGraph: Graph,
  root: AdvNodeData,
  cfg: any = {},
): void => {
  const model: Model = {
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
  };
  console.log('===nodes', model.nodes);
  const feimaFlowLayout = new FeimaFlowLayout(flowGraph, model, root);
  const newModel = feimaFlowLayout.layout();
  flowGraph.fromJSON(newModel);
};

interface SimpleNode {
  id: string;
  x: number;
  y: number;
  data: {
    position: CellPosition;
    maxMultipleY?: number; // multiple 节点中最大的 Y 坐标
    totalHeight?: number;
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

export function printMoxObj(obj: any) {
  console.log(toJS(obj));
}

class FeimaFlowLayout {
  flowGraph: Graph;
  cache: ModelCache;
  root: AdvNodeData;

  constructor(flowGraph: Graph, model: Model, root: AdvNodeData) {
    this.flowGraph = flowGraph;
    this.root = root;
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
      n.x = 0;
      n.y = 0;
      console.log('===n.id', n.id);
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
    this.cache = {
      nodes,
      edges,
      inMap,
      outMap,
      bottom1Map,
      bottom2Map,
      nodeMap,
      edgeMap,
    };
  }

  layout(): Model {
    const firstNode = this.cache.nodes.find((n) => {
      return !this.cache.inMap[n.id];
    });
    if (!firstNode) {
      throw new Error('no first node');
    }
    // firstNode.x = START_X;
    // firstNode.y = START_Y;

    this.setNodePosition(firstNode, this.cache);

    // 调整高度
    this.calHeight(this.root);
    this.setY(this.root);
    // console.log(this.cache.nodes);
    // this.root.

    // this.adjustPosition();
    this.translate(this.root, X_STEP, Y_STEP);

    return { nodes: this.cache.nodes, edges: this.cache.edges };
  }

  calHeight(node: NodeData): number {
    let result = 0;
    const comp = NodeCompStore.getNode(node.type);
    if (comp.metadata.childrenType === 'multiple') {
      for (let i = 0; i < node.multiple!.length; i++) {
        const multiple = node.multiple![i];
        let multiHeight = NODE_HEIGHT;
        for (let j = 0; j < multiple.children.length; j++) {
          const curNode = multiple.children[j];
          multiHeight = Math.max(multiHeight, this.calHeight(curNode));
        }
        result += multiHeight + Y_STEP;
      }
      result -= Y_STEP;
    } else if (comp.metadata.childrenType == 'then' && node.children) {
      let eachHeight = NODE_HEIGHT;
      for (let i = 0; i < node.children.length; i++) {
        eachHeight = Math.max(eachHeight, this.calHeight(node.children[i]));
      }
      result = eachHeight;
    } else {
      result = nodeSize;
    }
    if (this.cache.nodeMap[node.id]?.data) {
      this.cache.nodeMap[node.id].data.totalHeight = result;
    }
    return result;
  }

  setY(node: NodeData) {
    const comp = NodeCompStore.getNode(node.type);
    let totalHeight = 0;
    if (comp.metadata.childrenType === 'multiple') {
      let multiHeight = 0;
      for (let m = 0; m < node.multiple!?.length; m++) {
        const multiple = node.multiple![m];
        let childrenTotalHeight = NODE_HEIGHT;
        for (let i = 0; i < multiple.children!?.length; i++) {
          const curNode = multiple.children[i];
          const curHeight = this.cache.nodeMap[curNode.id].data.totalHeight!;
          childrenTotalHeight = Math.max(childrenTotalHeight, curHeight);
          this.setY(curNode);
        }
        multiHeight += childrenTotalHeight + Y_STEP;
      }
      multiHeight -= Y_STEP;
      totalHeight = multiHeight;
    } else if (comp.metadata.childrenType === 'then') {
      let childrenTotalHeight = NODE_HEIGHT;
      for (let i = 0; i < node.children!?.length; i++) {
        const curNode = node.children![i];
        const curHeight = this.cache.nodeMap[curNode.id].data.totalHeight!;
        childrenTotalHeight = Math.max(childrenTotalHeight, curHeight);
        this.setY(curNode);
      }
      totalHeight = childrenTotalHeight;
    }

    // const offset = 0;
    // const nodeY = this.cache.nodeMap[node.id].y;
    // const offset = nodeY + (nodeSize - childrenHeight) / 2 - first.y;
    const offset = totalHeight / 2;
    // this.translate(node, 0, offset);
  }

  // 移动节点及其子节点
  translate(node: NodeData, tx: number, ty: number) {
    if (isNaN(tx) || isNaN(ty)) {
      return;
    }
    console.log('====node', node);

    for (const n of travelNode(node)) {
      // if (node.id === 'start') {
      //   console.log('===start', toJS(node));
      //   console.log('====n', toJS(n));
      // }
      const curNodeId = n.current.id;
      const curNode = this.cache.nodeMap[curNodeId];
      // console.log('====n', n);
      console.log('===curNode', curNode);
      if (curNode) {
        curNode.x += tx;
        curNode.y += ty;
      }
      // if (this.cache.nodeMap[curNodeId]) {
      //   this.cache.nodeMap[curNodeId].x += tx;
      //   this.cache.nodeMap[curNodeId].y += ty;
      //   console.log('== this.cache.nodeMap', this.cache.nodeMap);
      // }
    }
  }

  adjustPosition() {
    let minY = Infinity;
    this.cache.nodes.forEach((n) => {
      minY = Math.min(minY, n.y);
    });
    if (minY < Y_STEP) {
      const addY = Y_STEP - minY;
      this.cache.nodes.forEach((n) => {
        n.y += addY;
      });
      this.cache.edges.forEach((e) => {
        e.vertices?.forEach((v) => {
          v.y += addY;
        });
      });
    }
  }

  setNodePosition(node: SimpleNode, cache: ModelCache) {
    // in
    const inInfos = this.findIns(node.id, cache);
    if (inInfos.length > 1) {
      let maxX = 0;
      // let sumY = 0;
      for (let i = 0; i < inInfos.length; i++) {
        const [inNode] = inInfos[i];
        maxX = Math.max(maxX, inNode.x);
        // sumY = sumY + inNode.y;
      }
      node.x = maxX + X_STEP;
      // node.y = sumY / inInfos.length;
      // for (let i = 0; i < inInfos.length; i++) {
      //   const [_inNode, inEdge] = inInfos[i];
      //   const lineY = _inNode.y;
      //   inEdge.vertices = [
      //     { x: node.x + nodeSize / 2, y: lineY + nodeSize / 2 },
      //   ];
      // }
    }

    // out
    const outInfos = this.findOuts(node.id, cache);
    if (outInfos.length > 0 && !isNaN(node.x)) {
      for (let i = 0; i < outInfos.length; i++) {
        const [outNode, outEdge] = outInfos[i];
        outNode.x = node.x + X_STEP;
        // outNode.y = node.y + Y_STEP * i - (Y_STEP * (outInfos.length - 1)) / 2;

        // if (outInfos.length > 1) {
        //   outEdge.vertices = [
        //     { x: node.x + nodeSize, y: outNode.y + nodeSize / 2 },
        //   ];
        // }
        this.setNodePosition(outNode, cache);
      }
    }

    // bottom1
    const bottom1Info = this.findBottom1(node.id, cache);
    if (bottom1Info) {
      const [n, e] = bottom1Info;
      n.x = node.x + X_STEP / 2;
      // n.y = node.y + Y_STEP * 1.2;
      this.setNodePosition(n, cache);

      // e.vertices = [{ x: node.x, y: n.y + nodeSize / 2 }];
    }

    // bottom2
    const bottom2Info = this.findBottom2(node.id, cache);
    if (bottom2Info) {
      const [n, e] = bottom2Info;

      // e.vertices = [
      //   { x: n.x + nodeSize * 2, y: n.y + nodeSize / 2 },
      //   { x: n.x + nodeSize * 2, y: n.y - nodeSize },
      //   { x: node.x + nodeSize, y: n.y - nodeSize },
      // ];
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

/**
 * 参考 https://github.com/antvis/hierarchy/blob/master/src/layout/mindmap.js
 * 思路：
 * 1. 第一次循环，先计算 x 坐标
 * 2. 第二次循环 secondWalk ，计算每个节点（含子节点）的总高度
 * 3. 第三次循环，计算 y 坐标
 * 4. 第四次循环 thirdWalk ，
 */
