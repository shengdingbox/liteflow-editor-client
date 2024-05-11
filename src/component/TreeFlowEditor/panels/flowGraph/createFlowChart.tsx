import ReactDOM from 'react-dom';
import { Button } from 'antd';
import { Cell, Graph } from '@antv/x6';
// import { debounce } from 'lodash';
import shortcuts from '../../common/shortcuts';
import registerEvents from '../../common/events';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  LITEFLOW_EDGE,
  LITEFLOW_ROUTER,
  LITEFLOW_ANCHOR,
} from '../../constant';
import MiniMapSimpleNode from './miniMapSimpleNode';
import liteflowEdge from '../../common/edge';
import liteflowRouter from '../../common/router';
import liteflowAnchor from '../../common/anchor';

Graph.registerEdge(LITEFLOW_EDGE, liteflowEdge);
Graph.registerRouter(LITEFLOW_ROUTER, liteflowRouter);
Graph.registerAnchor(LITEFLOW_ANCHOR, liteflowAnchor);

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
          ReactDOM.render(
            // @ts-ignore
            <Button size="small" className="liteflow-edge-add-button">
              +
            </Button>,
            content,
          );
        } else {
          const labelColor = label?.attrs?.label.color as string;
          if (labelColor) {
            content.style.color = labelColor;
          }
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
      // anchor: LITEFLOW_ANCHOR, // 'center',
      anchor: 'center',
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
    // interacting: {
    //   nodeMovable: true,
    //   edgeLabelMovable: true,
    // },
    interacting: true,
  });
  registerEvents(flowGraph);
  registerShortcuts(flowGraph);
  return flowGraph;
};

export default createFlowChart;
