import { CellView, Dom, Edge, EdgeView, Graph, Rectangle } from '@antv/x6';
import { NodeTypeEnum, ConditionTypeEnum } from '../constant';
import { forceLayout } from './layout';
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
      flowGraph.cleanSelection();
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
    flowGraph.cleanSelection();
    flowGraph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      edge,
    });
  });
  flowGraph.on('graph:addNodeOnEdge', (args: any) => {
    const { edge: currentEdge, node: droppingNode } = args;
    let targetNode = currentEdge.getTargetNode();
    let targetData = targetNode?.getData();
    let targetModel = targetData.model;
    let targetParent = targetData.parent;
    let targetIndex;
    if (!targetParent) {
      targetNode = currentEdge.getSourceNode();
      targetData = targetNode?.getData();
      targetModel = targetData.model;
      targetParent = targetData.parent;
      targetIndex = targetParent.children.indexOf(targetModel) + 1;
    } else {
      targetIndex = targetParent.children.indexOf(targetModel);
    }
    switch (droppingNode.shape) {
      case ConditionTypeEnum.WHEN:
        targetParent.children.splice(targetIndex, 0, {
          type: ConditionTypeEnum.WHEN,
          children: [
            {
              type: NodeTypeEnum.COMMON,
              id: `common${Math.ceil(Math.random() * 100)}`,
            },
          ],
        });
        flowGraph.trigger('model:change');
        break;
      case NodeTypeEnum.SWITCH:
        targetParent.children.splice(targetIndex, 0, {
          type: ConditionTypeEnum.SWITCH,
          condition: {
            type: NodeTypeEnum.SWITCH,
            id: `x${Math.ceil(Math.random() * 100)}`,
          },
          children: [
            {
              type: NodeTypeEnum.COMMON,
              id: `common${Math.ceil(Math.random() * 100)}`,
            },
          ],
        });
        flowGraph.trigger('model:change');
        break;
      case NodeTypeEnum.IF:
        targetParent.children.splice(targetIndex, 0, {
          type: ConditionTypeEnum.IF,
          condition: {
            type: NodeTypeEnum.IF,
            id: `x${Math.ceil(Math.random() * 100)}`,
          },
          children: [
            {
              type: NodeTypeEnum.COMMON,
              id: `common${Math.ceil(Math.random() * 100)}`,
            },
          ],
        });
        flowGraph.trigger('model:change');
        break;
      case NodeTypeEnum.FOR:
        targetParent.children.splice(targetIndex, 0, {
          type: ConditionTypeEnum.FOR,
          condition: {
            type: NodeTypeEnum.FOR,
            id: `x${Math.ceil(Math.random() * 100)}`,
          },
          children: [
            {
              type: ConditionTypeEnum.THEN,
              children: [
                {
                  type: NodeTypeEnum.COMMON,
                  id: `common${Math.ceil(Math.random() * 100)}`,
                },
              ],
            },
          ],
        });
        flowGraph.trigger('model:change');
        break;
      case NodeTypeEnum.WHILE:
        targetParent.children.splice(targetIndex, 0, {
          type: ConditionTypeEnum.WHILE,
          condition: {
            type: NodeTypeEnum.WHILE,
            id: `x${Math.ceil(Math.random() * 100)}`,
          },
          children: [
            {
              type: ConditionTypeEnum.THEN,
              children: [
                {
                  type: NodeTypeEnum.COMMON,
                  id: `common${Math.ceil(Math.random() * 100)}`,
                },
              ],
            },
          ],
        });
        flowGraph.trigger('model:change');
        break;
      case NodeTypeEnum.COMMON:
        targetParent.children.splice(targetIndex, 0, {
          type: ConditionTypeEnum.THEN,
          children: [
            {
              type: NodeTypeEnum.COMMON,
              id: `common${Math.ceil(Math.random() * 100)}`,
            },
          ],
        });
        flowGraph.trigger('model:change');
        break;
      default:
        targetParent.children.splice(targetIndex, 0, {
          type: NodeTypeEnum.COMMON,
          id: `common${Math.ceil(Math.random() * 100)}`,
        });
        flowGraph.trigger('model:change');
    }
  });
};

export default registerEvents;
