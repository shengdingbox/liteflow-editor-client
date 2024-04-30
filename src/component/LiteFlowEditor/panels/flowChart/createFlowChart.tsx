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
import { forceLayout } from '../../utils/layout';
import { getSelectedEdges } from '../../utils/flowChartUtils';
import MiniMapSimpleNode from './miniMapSimpleNode';
import liteflowEdge from '../../common/edge';
import liteflowRouter from '../../common/router';
import liteflowAnchor from '../../common/anchor';

Graph.registerEdge(LITEFLOW_EDGE, liteflowEdge);
Graph.registerRouter(LITEFLOW_ROUTER, liteflowRouter);
Graph.registerAnchor(LITEFLOW_ANCHOR, liteflowAnchor);

export function findViewsFromPoint(flowChart: Graph, x: number, y: number) {
  return flowChart
    .getCells()
    .map((cell) => flowChart.findViewByCell(cell))
    .filter((view) => {
      if (view != null) {
        let bBox = Dom.getBBox(view.container as any, {
          target: flowChart.view.stage,
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

const registerEvents = (flowChart: Graph): void => {
  // 当前拖动的节点、自动连接到边
  function autoLinkEdge(edge: Edge | null, args: any) {
    if (edge) {
      flowChart.startBatch('update');
      const oldTarget = edge.getTargetNode() || undefined;
      edge.setTarget(args.node);
      flowChart.addEdge({
        source: args.node,
        target: oldTarget,
      });
      forceLayout(flowChart);
      flowChart.stopBatch('update');
    }
  }
  let lastEdge: Edge | null;
  flowChart.on('node:added', (args) => {
    autoLinkEdge(lastEdge, args);
    flowChart.cleanSelection();
    flowChart.select(args.cell);
  });
  flowChart.on('node:moving', (args: any) => {
    flowChart.getEdges().forEach((edge: Edge) => {
      const edgeView = flowChart.findViewByCell(edge) as EdgeView;
      edgeView?.unhighlight();
    });
    const cellViews = findViewsFromPoint(flowChart, args.x, args.y);
    const edgeViews = cellViews.filter((cellView: CellView) =>
      cellView.isEdgeView(),
    );
    edgeViews.forEach((edgeView) => {
      edgeView.highlight();
    });
  });
  flowChart.on('node:moved', (args: any) => {
    flowChart.getEdges().forEach((edge: Edge) => {
      const edgeView = flowChart.findViewByCell(edge) as EdgeView;
      edgeView?.unhighlight();
    });
    const cellViews = findViewsFromPoint(flowChart, args.x, args.y);
    const edgeViews = cellViews.filter((cellView: CellView) =>
      cellView.isEdgeView(),
    );
    if (edgeViews?.length) {
      const lastEdge = flowChart.getCellById(edgeViews[0].cell.id) as Edge;
      autoLinkEdge(lastEdge, args);
    }
  });
  flowChart.on('selection:changed', () => {
    flowChart.trigger('toolBar:forceUpdate');
    flowChart.trigger('settingBar:forceUpdate');
  });
  flowChart.on('edge:selected', (args) => {
    args.edge.attr('line/stroke', '#feb663', { ignore: true });
  });
  flowChart.on('edge:unselected', (args) => {
    args.edge.attr('line/stroke', '#c1c1c1', { ignore: true });
  });
  flowChart.on('edge:mouseover', (args) => {
    lastEdge = args.edge;
    args.edge.attr('line/stroke', '#feb663', { ignore: true });
  });
  flowChart.on('edge:mouseleave', (args) => {
    lastEdge = null;
    const { edge } = args;
    const selectedEdges = getSelectedEdges(flowChart);
    if (selectedEdges[0] !== edge) {
      args.edge.attr('line/stroke', '#c1c1c1', { ignore: true });
    }
  });
  flowChart.on('node:dblclick', () => {
    flowChart.trigger('graph:editNode');
  });
  flowChart.on('node:click', (args) => {
    const targetNode = args.node;
    if (targetNode.shape === ConditionTypeEnum.WHEN) {
      const targetNodeData = targetNode.getData().model;
      targetNodeData.children.push({
        type: NodeTypeEnum.COMMON,
        id: `xxx${Math.ceil(Math.random() * 100)}`,
      });
      flowChart.cleanSelection();
      flowChart.trigger('model:change');
    }
  });
  flowChart.on('blank:contextmenu', (args) => {
    const {
      e: { clientX, clientY },
    } = args;
    flowChart.cleanSelection();
    flowChart.trigger('graph:showContextMenu', {
      x: clientX,
      y: clientY,
      scene: 'blank',
    });
  });
  flowChart.on('node:contextmenu', (args) => {
    const {
      e: { clientX, clientY },
      node,
    } = args;
    // NOTE: if the clicked node is not in the selected nodes, then clear selection
    if (!flowChart.getSelectedCells().includes(node)) {
      flowChart.cleanSelection();
      flowChart.select(node);
    }
    flowChart.trigger('graph:showContextMenu', {
      x: clientX,
      y: clientY,
      scene: 'node',
    });
  });
  flowChart.on('button:click', (args: any) => {
    const {
      e: { clientX, clientY },
      edge,
    } = args;
    flowChart.cleanSelection();
    flowChart.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      edge,
    });
  });
  flowChart.on('graph:addNodeOnEdge', (args: any) => {
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
        flowChart.trigger('model:change');
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
        flowChart.trigger('model:change');
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
        flowChart.trigger('model:change');
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
        flowChart.trigger('model:change');
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
        flowChart.trigger('model:change');
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
        flowChart.trigger('model:change');
        break;
      default:
        targetParent.children.splice(targetIndex, 0, {
          type: NodeTypeEnum.COMMON,
          id: `common${Math.ceil(Math.random() * 100)}`,
        });
        flowChart.trigger('model:change');
    }
  });
};

const registerShortcuts = (flowChart: Graph): void => {
  Object.values(shortcuts).forEach((shortcut) => {
    const { keys, handler } = shortcut;
    flowChart.bindKey(keys, () => handler(flowChart));
  });
};

const createFlowChart = (
  container: HTMLDivElement,
  miniMapContainer: HTMLDivElement,
): Graph => {
  const flowChart = new Graph({
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
            flowChart.trigger('button:click', { e, edge });
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
  registerEvents(flowChart);
  registerShortcuts(flowChart);
  return flowChart;
};

export default createFlowChart;
