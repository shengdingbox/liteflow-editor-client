import { Dom, Graph, Rectangle } from '@antv/x6';
import { NodeTypeEnum, ConditionTypeEnum } from '../constant';
import { getSelectedEdges } from '../utils/flowChartUtils';
import { ELBuilder } from '../model/builder';

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

const registerEvents = (flowGraph: Graph): void => {
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
    if (targetNode.shape === ConditionTypeEnum.WHEN) {
      const targetNodeData = targetNode.getData().model;
      targetNodeData.children.push({
        type: NodeTypeEnum.COMMON,
        id: `xxx${Math.ceil(Math.random() * 100)}`,
      });
      flowGraph.trigger('model:change');
    }
  });
  flowGraph.on('blank:contextmenu', (args) => {
    const {
      e: { clientX, clientY },
    } = args;
    flowGraph.cleanSelection();
    flowGraph.trigger('graph:showContextMenu', {
      x: clientX,
      y: clientY,
      scene: 'blank',
    });
  });
  flowGraph.on('node:contextmenu', (args) => {
    const {
      e: { clientX, clientY },
      node,
    } = args;
    // NOTE: if the clicked node is not in the selected nodes, then clear selection
    if (!flowGraph.getSelectedCells().includes(node)) {
      flowGraph.cleanSelection();
      flowGraph.select(node);
    }
    flowGraph.trigger('graph:showContextMenu', {
      x: clientX,
      y: clientY,
      scene: 'node',
    });
  });
  flowGraph.on('button:click', (args: any) => {
    const {
      e: { clientX, clientY },
      edge,
    } = args;
    flowGraph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      edge,
    });
  });
  flowGraph.on('graph:addNodeOnEdge', (args: any) => {
    const { edge: currentEdge, node: droppingNode } = args;
    let targetNode = currentEdge.getSourceNode();
    let targetData = targetNode?.getData();
    let targetModel = targetData.model;
    let targetParent = targetModel.parent;
    let targetIndex;
    if (!targetParent) {
      targetNode = currentEdge.getTargetNode();
      targetData = targetNode?.getData();
      targetModel = targetData.model;
      targetParent = targetModel.parent || targetModel;
      targetIndex = targetParent.children.indexOf(targetModel);
    } else {
      targetIndex = targetParent.children.indexOf(targetModel) + 1;
    }
    const newELNode = ELBuilder.createELNode(droppingNode.shape, targetParent);
    targetParent.appendChild(newELNode, targetIndex);
    flowGraph.trigger('model:change');
  });
};

export default registerEvents;
