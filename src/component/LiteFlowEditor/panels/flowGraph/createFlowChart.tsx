import ReactDOM from 'react-dom';
import { Button } from 'antd';
import {
  Cell,
  CellView,
  Dom,
  Edge,
  EdgeView,
  Graph,
  Rectangle,
} from '@antv/x6';
import { debounce } from 'lodash';
import shortcuts from '../../common/shortcuts';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  NodeTypeEnum,
  ConditionTypeEnum,
  LITEFLOW_EDGE,
  LITEFLOW_ROUTER,
  LITEFLOW_ANCHOR,
} from '../../constant';
import { forceLayout } from '../../common/layout';
import { getSelectedEdges } from '../../utils/flowChartUtils';
import MiniMapSimpleNode from './miniMapSimpleNode';
import liteflowEdge from '../../common/edge';
import liteflowRouter from '../../common/router';
import liteflowAnchor from '../../common/anchor';

Graph.registerEdge(LITEFLOW_EDGE, liteflowEdge);
Graph.registerRouter(LITEFLOW_ROUTER, liteflowRouter);
Graph.registerAnchor(LITEFLOW_ANCHOR, liteflowAnchor);

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
  // 当前拖动的节点、自动连接到边
  function autoLinkEdge(edge: Edge | null, args: any) {
    if (edge) {
      flowGraph.startBatch('update');
      const oldTarget = edge.getTargetNode() || undefined;
      edge.setTarget(args.node);
      flowGraph.addEdge({
        source: args.node,
        target: oldTarget,
      });
      forceLayout(flowGraph);
      flowGraph.stopBatch('update');
    }
  }
  let lastEdge: Edge | null;
  flowGraph.on('node:added', (args) => {
    autoLinkEdge(lastEdge, args);
    flowGraph.cleanSelection();
    flowGraph.select(args.cell);
  });
  flowGraph.on('node:moving', (args: any) => {
    flowGraph.getEdges().forEach((edge: Edge) => {
      const edgeView = flowGraph.findViewByCell(edge) as EdgeView;
      edgeView?.unhighlight();
    });
    const cellViews = findViewsFromPoint(flowGraph, args.x, args.y);
    const edgeViews = cellViews.filter((cellView: CellView) =>
      cellView.isEdgeView(),
    );
    edgeViews.forEach((edgeView) => {
      edgeView.highlight();
    });
  });
  flowGraph.on('node:moved', (args: any) => {
    flowGraph.getEdges().forEach((edge: Edge) => {
      const edgeView = flowGraph.findViewByCell(edge) as EdgeView;
      edgeView?.unhighlight();
    });
    const cellViews = findViewsFromPoint(flowGraph, args.x, args.y);
    const edgeViews = cellViews.filter((cellView: CellView) =>
      cellView.isEdgeView(),
    );
    if (edgeViews?.length) {
      const lastEdge = flowGraph.getCellById(edgeViews[0].cell.id) as Edge;
      autoLinkEdge(lastEdge, args);
    }
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
    lastEdge = args.edge;
    args.edge.attr('line/stroke', '#feb663', { ignore: true });
  });
  flowGraph.on('edge:mouseleave', (args) => {
    lastEdge = null;
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

const registerShortcuts = (flowGraph: Graph): void => {
  Object.values(shortcuts).forEach((shortcut) => {
    const { keys, handler } = shortcut;
    flowGraph.bindKey(keys, () => handler(flowGraph));
  });
};

const createFlowChart = (
  container: HTMLDivElement,
  miniMapContainer: HTMLDivElement,
): Graph => {
  const flowGraph = new Graph({
    autoResize: true,
    container,
    rotating: false,
    resizing: false,
    onEdgeLabelRendered: (args) => {
      const { edge, selectors, label } = args;
      const content = selectors.foContent as HTMLElement;
      if (content) {
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';
        if (label?.attrs?.label.text === '+') {
          const handleOnClick = debounce((e: any) => {
            flowGraph.trigger('button:click', { e, edge });
          }, 100);
          ReactDOM.render(
            // @ts-ignore
            <Button
              size="small"
              onClick={handleOnClick}
              className="liteflow-edge-add-button"
            >
              +
            </Button>,
            content,
          );
        } else {
          content.appendChild(
            document.createTextNode(label?.attrs?.label.text + ''),
          );
        }
      }
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/clipboard
    clipboard: {
      enabled: true,
      useLocalStorage: true,
    },
    // https://x6.antv.vision/zh/docs/tutorial/intermediate/connector
    connecting: {
      snap: true,
      allowBlank: false,
      allowLoop: false,
      allowNode: false,
      allowEdge: false,
      dangling: true,
      highlight: true,
      anchor: LITEFLOW_ANCHOR, // 'center',
      connectionPoint: 'bbox',
      // connector: {
      //   name: 'jumpover', //两条线交叉时，出现线桥。
      // },
      router: 'normal', // LITEFLOW_ROUTER, // 'normal',
      validateEdge: (args) => {
        const { edge } = args;
        return !!(edge?.target as any)?.port;
      },
      validateConnection({
        sourceView,
        targetView,
        sourceMagnet,
        targetMagnet,
      }) {
        if (!sourceMagnet) {
          return false;
        } else if (!targetMagnet) {
          return false;
        } else {
          return sourceView !== targetView;
        }
      },
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/background
    background: {
      color: '#ffffff',
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/grid
    grid: {
      visible: false,
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/selection
    selecting: {
      enabled: true,
      rubberband: false, // 启用框选
      movable: true,
      multiple: true,
      strict: true,
      showNodeSelectionBox: true,
      selectNodeOnMoved: true,
      pointerEvents: 'none',
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/snapline
    snapline: {
      enabled: true,
      clean: 100,
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/keyboard
    keyboard: {
      enabled: true,
      global: false,
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/history
    history: {
      enabled: true,
      beforeAddCommand(event, args: any) {
        if (args.options) {
          return args.options.ignore !== true;
        }
      },
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/minimap
    minimap: {
      width: 150,
      height: 150,
      minScale: MIN_ZOOM,
      maxScale: MAX_ZOOM,
      enabled: true,
      scalable: false,
      container: miniMapContainer,
      graphOptions: {
        async: true,
        getCellView(cell: Cell) {
          if (cell.isNode()) {
            return MiniMapSimpleNode;
          }
        },
        createCellView(cell: Cell) {
          if (cell.isEdge()) {
            return null;
          }
        },
      },
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/scroller
    scroller: {
      enabled: true,
      pageVisible: false,
      pageBreak: false,
      pannable: true,
    },
    mousewheel: {
      enabled: true,
      minScale: MIN_ZOOM,
      maxScale: MAX_ZOOM,
      modifiers: ['ctrl', 'meta'],
    },
    // embedding: {
    //   enabled: true,
    //   findParent({ node }) {
    //     const bbox = node.getBBox();
    //     return this.getNodes().filter((grahpNode) => {
    //       const nodeData = grahpNode.getData();
    //       if (nodeData && nodeData.parent) {
    //         const targetBBox = grahpNode.getBBox();
    //         return bbox.isIntersectWithRect(targetBBox);
    //       }
    //       return false;
    //     });
    //   },
    //   frontOnly: false,
    // },
    interacting: {
      nodeMovable: true,
      edgeLabelMovable: true,
    },
  });
  registerEvents(flowGraph);
  registerShortcuts(flowGraph);
  return flowGraph;
};

export default createFlowChart;
