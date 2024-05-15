import { Cell, Graph } from '@antv/x6';
import '@antv/x6-react-shape';
import { Button } from 'antd';
import ReactDOM from 'react-dom';
// import { debounce } from 'lodash';
import liteflowAnchor from '../common/anchor';
import liteflowEdge from '../common/edge';
import liteflowRouter from '../common/router';
import shortcuts from '../common/shortcuts';
import NodeView from '../components/NodeView';
import {
  LITEFLOW_ANCHOR,
  LITEFLOW_ROUTER,
  MAX_ZOOM,
  MIN_ZOOM,
  NODE_HEIGHT,
  NODE_WIDTH,
  TREEFLOW_EDGE,
} from '../constant';
import MiniMapSimpleNode from '../panels/flowGraph/miniMapSimpleNode';

import Common from '../buildinNodes/common';
import End from '../buildinNodes/end';
import MultiplePlaceholder from '../buildinNodes/multiple-placeholder';
import Start from '../buildinNodes/start';
import { Grapher } from '../context/GraphContext';
import { NodeCompStore } from '../store/CompStore';
import { NodeComp } from '../types/node';

Graph.registerEdge(TREEFLOW_EDGE, liteflowEdge());
Graph.registerEdge('TREEFLOW_EDGE_NOARROW', liteflowEdge('withoutArrow'));
Graph.registerRouter(LITEFLOW_ROUTER, liteflowRouter);
Graph.registerAnchor(LITEFLOW_ANCHOR, liteflowAnchor);

function registerNodes(compGroups: Array<[string, NodeComp[]]>) {
  const allComps = [Start, End, Common, MultiplePlaceholder];
  compGroups.forEach((g) => {
    allComps.push(...g[1]);
  });
  allComps.forEach((nodeComp) => {
    // 注册AntV X6节点
    const { type, label, icon } = nodeComp.metadata;
    let width = NODE_WIDTH;
    let height = NODE_HEIGHT;
    // console.log('===type', type);
    // if (type === 'NodeVirtualComponent') {
    // width = 5;
    // height = 5;
    // }
    Graph.registerNode(type, {
      primer: 'circle',
      inherit: 'react-shape',
      component(node: any) {
        return <NodeView node={node} icon={icon} />;
      },
      width,
      height,
      attrs: {
        label: {
          refX: 0.5,
          refY: '100%',
          refY2: 20,
          text: label,
          fill: '#333',
          fontSize: 13,
          textAnchor: 'middle',
          textVerticalAnchor: 'middle',
          textWrap: {
            width: 80,
            height: 32,
            ellipsis: true,
            breakWord: true,
          },
        },
      },
    });

    Graph.registerReactComponent(type, function component(node: any) {
      return <NodeView node={node} icon={icon} />;
    });

    NodeCompStore.registerNode(nodeComp);
  });
}

export const bindKeyboards = (grapher: Grapher): void => {
  Object.values(shortcuts).forEach((shortcut) => {
    const { keys, handler } = shortcut;
    grapher.flowGraph.bindKey(keys, () => handler(grapher));
  });
};

const createFlowChart = (
  container: HTMLDivElement,
  miniMapContainer: HTMLDivElement,
  compGroups?: Array<[string, NodeComp[]]>,
): Graph => {
  registerNodes(compGroups || []);
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

  return flowGraph;
};

export default createFlowChart;
