import ReactDOM from 'react-dom';
import { Button, Tooltip } from 'antd';
import { Cell, Graph } from '@antv/x6';
import { debounce } from 'lodash';
import { MIN_ZOOM, MAX_ZOOM } from '../../constant';
import MiniMapSimpleNode from './miniMapSimpleNode';
import {
  LITEFLOW_ANCHOR,
  registerEvents,
  registerShortcuts,
} from '../../common';

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
            <Tooltip title="插入节点">
              <Button
                size="small"
                onClick={handleOnClick}
                className="liteflow-edge-add-button"
              >
                +
              </Button>
            </Tooltip>,
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
      color: '#f4f7fc',
    },
    // https://x6.antv.vision/zh/docs/tutorial/basic/grid
    grid: {
      visible: true,
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
      nodeMovable: false,
      edgeLabelMovable: false,
    },
  });
  registerEvents(flowGraph);
  registerShortcuts(flowGraph);
  return flowGraph;
};

export default createFlowChart;
