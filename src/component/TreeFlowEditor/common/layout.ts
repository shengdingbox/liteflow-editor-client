import { Graph } from '@antv/x6';
import { toJS } from 'mobx';

import { NODE_HEIGHT } from '../constant';
import { NodeCompStore } from '../store/CompStore';
import { travelNode } from '../store/travel';
import { AdvNodeData, CellPosition, NodeData } from '../types/node';

const nodeSize: number = 30;

const X_STEP = 80;
const Y_STEP = 50;

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
  // console.log('===nodes', model.nodes);
  const feimaFlowLayout = new FeimaFlowLayout(flowGraph, model, root);
  const newModel = feimaFlowLayout.layout();
  flowGraph.fromJSON(newModel);
};

interface HeightInfo {
  total: number;
  base: number;
}

interface SimpleNode {
  id: string;
  x: number;
  y: number;
  data: {
    position: CellPosition;
    heightInfo?: HeightInfo;
    totalHeight?: string;
    // baseHeight?: number;
    isVirtual?: boolean;
    [key: string]: any;
  };
}
interface SimpleEdge {
  id: string;
  source: { cell: string; port: string };
  target: { cell: string; port: string };
  vertices?: Array<{ x: number; y: number }>;
  data: {
    position: CellPosition;
  };
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

    this.setNodePosition(firstNode, this.cache);

    // 调整高度
    this.calHeight(this.root);
    this.setY();
    this.translate(this.root, X_STEP, Y_STEP);

    return { nodes: this.cache.nodes, edges: this.cache.edges };
  }

  calHeight(node: AdvNodeData): HeightInfo {
    let result: HeightInfo = { total: 0, base: 0 };
    const comp = NodeCompStore.getNode(node.type);
    if (comp.metadata.childrenType === 'multiple') {
      let firstBaseHeight = 0;
      let lastBaseRemainingHeight = 0;
      for (let i = 0; i < node.multiple!.length; i++) {
        const multiple = node.multiple![i];
        let multiTotalHeight = NODE_HEIGHT;
        let multiBaseHeight = NODE_HEIGHT / 2;
        for (let j = 0; j < multiple.children.length; j++) {
          const curNode = multiple.children[j];
          const { total, base } = this.calHeight(curNode);
          multiTotalHeight = Math.max(multiTotalHeight, total);
          multiBaseHeight = Math.max(multiBaseHeight, base);
        }
        if (i === 0) {
          firstBaseHeight = multiBaseHeight;
        } else if (i === node.multiple!?.length - 1) {
          lastBaseRemainingHeight = multiTotalHeight - multiBaseHeight;
        }
        result.total += multiTotalHeight + Y_STEP;
      }
      result.total -= Y_STEP;
      result.base =
        (result.total - firstBaseHeight - lastBaseRemainingHeight) / 2 +
        firstBaseHeight;
      // result.base =
    } else if (comp.metadata.childrenType == 'then' && node.children) {
      let eachHeight = NODE_HEIGHT;
      for (let i = 0; i < node.children.length; i++) {
        eachHeight = Math.max(
          eachHeight,
          this.calHeight(node.children[i]).total,
        );
      }
      result.total = eachHeight;
      result.base = eachHeight / 2;
    } else if (comp.metadata.childrenType === 'include' && node.children) {
      let eachHeight = NODE_HEIGHT;
      for (let i = 0; i < node.children.length; i++) {
        eachHeight = Math.max(
          eachHeight,
          this.calHeight(node.children[i]).total,
        );
      }
      result.total = eachHeight + Y_STEP;
      result.base = nodeSize / 2;
    } else {
      result.total = nodeSize;
      result.base = nodeSize / 2;
    }

    const graphNode = this.cache.nodeMap[node.id];
    if (graphNode.data) {
      graphNode.data.heightInfo = result;
      // this.cache.nodeMap[node.id].attrs.label = { text: result };
      // graphNode.attrs.label = {
      //   text: `${graphNode.data.position.multiIndex ?? ''}_${
      //     graphNode.data.position.childrenIndex ?? ''
      //   }`,
      // };
      // graphNode.attrs.label = {
      //   text: `${graphNode.data.heightInfo.base}_${graphNode.data.heightInfo.total}`,
      // };
    }
    return result;
  }

  setY() {
    const queue = [this.root];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      const curComp = NodeCompStore.getNode(cur.type);
      const childrenType = curComp.metadata.childrenType;
      if (childrenType == null) {
        // 普通节点，无需处理
      } else if (childrenType === 'include') {
        let maxTotalHeight = 0;
        let maxBaseHeight = 0;
        for (let i = 0; i < cur.children!?.length; i++) {
          queue.push(cur.children![i]);
          maxTotalHeight = Math.max(
            maxTotalHeight,
            this.cache.nodeMap[cur.children![i].id].data.heightInfo?.total!,
          );
          maxBaseHeight = Math.max(
            maxBaseHeight,
            this.cache.nodeMap[cur.children![i].id].data.heightInfo?.base!,
          );
        }
        for (let i = 0; i < cur.children!?.length; i++) {
          const node = cur.children![i];
          this.translate(node, 0, maxBaseHeight + Y_STEP);
          // this.translate(node, 0, );
        }
      } else if (childrenType === 'then') {
        // const baseHeight = this.cache.nodeMap[cur.id].data.heightInfo?.base!;
        // this.translate(cur, 0, baseHeight);
        for (let i = 0; i < cur.children!?.length; i++) {
          queue.push(cur.children![i]);
        }
        // if (cur.children) {
        // this.setChildrenY(cur.children, -baseHeight);
        // }
      } else if (childrenType === 'multiple') {
        let multiTotalHeight = 0;
        let maxBaseHeight = 0;
        for (let m = 0; m < cur.multiple!?.length; m++) {
          let mutiCur = cur.multiple![m];
          let maxTotalHeight = 0;
          for (let i = 0; i < mutiCur.children!?.length; i++) {
            queue.push(mutiCur.children![i]);
            this.translate(mutiCur.children[i], 0, multiTotalHeight);
            const { total: childTotalHeight, base: childBaseHeight } =
              this.cache.nodeMap[mutiCur.children![i].id].data.heightInfo!;
            maxTotalHeight = Math.max(maxTotalHeight, childTotalHeight);
            maxBaseHeight = Math.max(maxBaseHeight, childBaseHeight);
          }
          multiTotalHeight += maxTotalHeight + Y_STEP;
        }
        multiTotalHeight -= Y_STEP;

        const baseHeight = this.cache.nodeMap[cur.id].data.heightInfo?.base!;
        for (let m = 0; m < cur.multiple!?.length; m++) {
          let mutiCur = cur.multiple![m];
          this.setChildrenY(mutiCur.children, -baseHeight);
        }
      }
    }
  }

  setChildrenY(children: AdvNodeData[], ty: number) {
    let maxTotalHeight = 0;
    let maxBaseHeight = 0;
    for (let i = 0; i < children.length; i++) {
      const { total: childTotalHeight, base: childBaseHeight } =
        this.cache.nodeMap[children![i].id].data.heightInfo!;
      maxTotalHeight = Math.max(maxTotalHeight, childTotalHeight);
      maxBaseHeight = Math.max(maxBaseHeight, childBaseHeight);
    }
    for (let i = 0; i < children.length; i++) {
      this.translate(children[i], 0, maxBaseHeight + ty);
    }
  }

  // 移动节点及其子节点
  translate(node: NodeData, tx: number, ty: number) {
    for (const n of travelNode(node)) {
      this.translateOne(n.current, tx, ty);
    }
  }

  translateOne(node: NodeData, tx: number, ty: number) {
    if (isNaN(tx) || isNaN(ty)) {
      return;
    }
    const curNodeId = node.id;
    const curNode = this.cache.nodeMap[curNodeId];
    if (curNode) {
      curNode.x += tx;
      curNode.y += ty;
    }
  }

  setNodePosition(node: SimpleNode, cache: ModelCache) {
    // in
    const inInfos = this.findIns(node.id, cache);
    if (inInfos.length > 1) {
      let maxX = 0;
      // let sumY = 0;
      for (let i = 0; i < inInfos.length; i++) {
        const [inNode, inEdge] = inInfos[i];
        inEdge.data.position = {
          ...inNode.data.position,
          childrenIndex: inNode.data.position.childrenIndex! + 1,
        };
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
