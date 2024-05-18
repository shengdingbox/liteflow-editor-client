import { Dom, Graph, Rectangle } from '@antv/x6';
import { Grapher } from '../context/GraphContext';
import { getSelectedEdges } from '../utils/flowChartUtils';

export function findViewsFromPoint(flowGraph: Graph, x: number, y: number) {
  return flowGraph
    .getCells()
    .map((cell) => flowGraph.findViewByCell(cell))
    .filter((view) => {
      if (view != null) {
        let bBox = Dom.getBBox(view.container as any, {
          target: flowGraph.view.stage,
        });
        if (bBox.height < 16) {
          bBox = Rectangle.create({
            x: bBox.x,
            y: bBox.y - 8 + bBox.height / 2,
            width: bBox.width,
            height: 16,
          });
        }
        return bBox.containsPoint({ x, y });
      }
      return false;
    }) as any[];
}

const registerEvents = (grapher: Grapher): void => {
  const flowGraph = grapher.flowGraph;
  const store = grapher.store;
  flowGraph.on('edge:mouseenter', ({ edge }) => {
    store.currentEdge = edge;
  });
  flowGraph.on('edge:mouseleave', (e) => {
    store.currentEdge = undefined;
  });
  flowGraph.on('selection:changed', () => {
    flowGraph.trigger('toolBar:forceUpdate');
    flowGraph.trigger('settingBar:forceUpdate');
  });
  flowGraph.on('edge:selected', (args) => {
    args.edge.attr('line/stroke', '#feb663', { ignore: true });
  });
  flowGraph.on('edge:unselected', (args) => {
    args.edge.attr('line/stroke', '#c1c1c1', { ignore: true });
  });
  flowGraph.on('edge:mouseover', (args) => {
    args.edge.attr('line/stroke', '#feb663', { ignore: true });
  });
  flowGraph.on('edge:mouseleave', (args) => {
    const { edge } = args;
    const selectedEdges = getSelectedEdges(flowGraph);
    if (selectedEdges[0] !== edge) {
      args.edge.attr('line/stroke', '#c1c1c1', { ignore: true });
    }
  });
  flowGraph.on('node:dblclick', () => {
    flowGraph.trigger('graph:editNode');
  });
  flowGraph.on('node:click', (args) => {
    const targetNode = args.node;
    // if (targetNode.shape === ConditionTypeEnum.WHEN) {
    //   const targetNodeData = targetNode.getData().model;
    //   targetNodeData.children.push({
    //     type: NodeTypeEnum.COMMON,
    //     id: `xxx${Math.ceil(Math.random() * 100)}`,
    //   });
    //   flowGraph.trigger('model:change');
    // }
  });
  flowGraph.on('graph:addNodeOnEdge', (args: any) => {
    const { edge: currentEdge, node: droppingNode } = args;
    console.log(
      '=====currentEdge.data.position, droppingNode.data.node',
      currentEdge.data.position,
      droppingNode.data.node,
    );
    store.insertNode(currentEdge.data.position, droppingNode.data.node);
  });
};

export default registerEvents;
