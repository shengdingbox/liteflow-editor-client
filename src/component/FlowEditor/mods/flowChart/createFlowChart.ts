import shortcuts from '../../common/shortcuts';
import {
  Cell,
  CellView,
  Edge,
  EdgeView,
  Graph,
  Node,
  Point,
  Registry,
} from '@antv/x6';
import { MIN_ZOOM, MAX_ZOOM } from '../../common/const';
import { getSelectedEdges, forceLayout } from '../../utils/flowChartUtils';
import MiniMapSimpleNode from '../../components/miniMapSimpleNode';
import RootNode from '../../common/cells/root';
import GroupNode from '../../common/cells/group';

const registerEvents = (flowChart: Graph): void => {
  // 当前拖动的节点、自动连接到边
  function autoLinkEdge(edge: Edge | null, args: any) {
    if (edge) {
      flowChart.startBatch('update');
      const parentNode = edge.getSourceNode()?.getParent();
      parentNode?.addChild(args.node);
      const oldTarget = edge.getTargetNode() || undefined;
      const oldPort = edge.getTargetPortId() || 'left';
      edge.setTarget(args.node, { port: 'left' });
      flowChart.addEdge({
        source: args.node,
        sourcePort: 'right',
        target: oldTarget,
        targetPort: oldPort,
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
  flowChart.on('node:moving', (args) => {
    flowChart.getEdges().forEach((edge: Edge) => {
      const edgeView = flowChart.findViewByCell(edge) as EdgeView;
      edgeView?.unhighlight();
    });
    const cellViews = flowChart.findViewsFromPoint(args.x, args.y);
    const edgeViews = cellViews.filter((cellView: CellView) =>
      cellView.isEdgeView(),
    );
    edgeViews.forEach((edgeView) => {
      edgeView.highlight();
    });
  });
  flowChart.on('node:moved', (args) => {
    flowChart.getEdges().forEach((edge: Edge) => {
      const edgeView = flowChart.findViewByCell(edge) as EdgeView;
      edgeView?.unhighlight();
    });
    const cellViews = flowChart.findViewsFromPoint(args.x, args.y);
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
  flowChart.on('edge:connected', (args) => {
    const edge = args.edge as Edge;
    const sourceNode = edge.getSourceNode() as Node;
    if (sourceNode && sourceNode.shape === 'flow-branch') {
      const portId = edge.getSourcePortId();
      if (portId === 'right' || portId === 'bottom') {
        edge.setLabelAt(0, sourceNode.getPortProp(portId, 'attrs/text/text'));
        sourceNode.setPortProp(portId, 'attrs/text/text', '');
      }
    }
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
    container,
    rotating: false,
    resizing: false,
    // https://x6.antv.vision/zh/docs/tutorial/basic/clipboard
    clipboard: {
      enabled: true,
      useLocalStorage: true,
    },
    // https://x6.antv.vision/zh/docs/tutorial/intermediate/connector
    connecting: {
      snap: true,
      allowBlank: false,
      allowMulti: 'withPort',
      allowLoop: false,
      allowNode: false,
      allowEdge: false,
      dangling: true,
      highlight: true,
      anchor: 'center',
      connectionPoint: 'bbox',
      connector: {
        name: 'jumpover', //两条线交叉时，出现线桥。
      },
      router: 'manhattan',
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
    // minimap: {
    //   width: (150 * container.offsetWidth) / container.offsetHeight,
    //   height: 150,
    //   minScale: MIN_ZOOM,
    //   maxScale: MAX_ZOOM,
    //   enabled: true,
    //   scalable: false,
    //   container: miniMapContainer,
    //   graphOptions: {
    //     async: true,
    //     getCellView(cell: Cell) {
    //       if (cell.isNode()) {
    //         return MiniMapSimpleNode;
    //       }
    //     },
    //     createCellView(cell: Cell) {
    //       if (cell.isEdge()) {
    //         return null;
    //       }
    //     },
    //   },
    // },
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
