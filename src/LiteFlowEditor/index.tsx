import React, { useRef, useState, useEffect } from 'react';
import { Graph, Edge, Cell, Node } from '@antv/x6';
import createFlowGraph from './panels/flowGraph/createFlowGraph';
import NodeEditorModal from './panels/flowGraph/nodeEditorModal';
import FlowGraphContextMenu from './panels/flowGraph/contextMenu';
import FlowGraphContextPad from './panels/flowGraph/contextPad';
import GraphContext from './context/GraphContext';
import Layout from './panels/layout';
import SideBar from './panels/sideBar';
import ToolBar from './panels/toolBar';
import SettingBar from './panels/settingBar';
import styles from './index.module.less';
import '@antv/x6/dist/x6.css';
import { forceLayout } from './common/layout';
import { useModel } from './hooks';

interface IProps {
  onReady?: (graph: Graph) => void;
}

const defaultMenuInfo: IMenuInfo = {
  x: 0,
  y: 0,
  scene: 'blank',
  visible: false,
};

interface IPadInfo {
  x: number;
  y: number;
  edge?: Edge;
  node?: Node;
  scene?: IContextPadScene;
  visible: boolean;
}

const defaultPadInfo: IPadInfo = {
  x: 0,
  y: 0,
  scene: 'append',
  visible: false,
};

const LiteFlowEditor: React.FC<IProps> = (props) => {
  const { onReady } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [flowGraph, setFlowGraph] = useState<Graph>();
  const [contextMenuInfo, setContextMenuInfo] =
    useState<IMenuInfo>(defaultMenuInfo);
  const [contextPadInfo, setContextPadInfo] =
    useState<IPadInfo>(defaultPadInfo);

  useEffect(() => {
    if (graphRef.current && miniMapRef.current) {
      const flowGraph = createFlowGraph(graphRef.current, miniMapRef.current);
      onReady?.(flowGraph);
      setFlowGraph(flowGraph);
    }
  }, []);

  // resize flowGraph's size when window size changes
  useEffect(() => {
    const handler = () => {
      requestAnimationFrame(() => {
        if (flowGraph && wrapperRef && wrapperRef.current) {
          const width = wrapperRef.current.clientWidth;
          const height = wrapperRef.current.clientHeight;
          flowGraph.resize(width, height);
        }
      });
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [flowGraph, wrapperRef]);

  // NOTE: listen toggling context menu event
  useEffect(() => {
    const showHandler = (info: IMenuInfo) => {
      flowGraph?.lockScroller();
      setContextMenuInfo({ ...info, visible: true });
    };
    const hideHandler = () => {
      flowGraph?.unlockScroller();
      setContextMenuInfo({ ...contextMenuInfo, visible: false });
    };
    const showContextPad = (info: IPadInfo) => {
      flowGraph?.lockScroller();
      setContextPadInfo({ ...info, visible: true });
    };
    const hideContextPad = () => {
      flowGraph?.unlockScroller();
      setContextPadInfo({ ...contextPadInfo, visible: false });
    };
    const handleModelChange = () => {
      if (flowGraph) {
        const model = useModel();
        const modelJSON = model.toCells() as Cell[];
        flowGraph.scroller.disableAutoResize();
        flowGraph.startBatch('update');
        flowGraph.resetCells(modelJSON);
        forceLayout(flowGraph);
        flowGraph.stopBatch('update');
        flowGraph.scroller.enableAutoResize();
      }
    };
    if (flowGraph) {
      flowGraph.on('graph:showContextMenu', showHandler);
      flowGraph.on('graph:hideContextMenu', hideHandler);
      flowGraph.on('graph:showContextPad', showContextPad);
      flowGraph.on('graph:hideContextPad', hideContextPad);
      flowGraph.on('model:change', handleModelChange);
    }
    return () => {
      if (flowGraph) {
        flowGraph.off('graph:showContextMenu', showHandler);
        flowGraph.off('graph:hideContextMenu', hideHandler);
        flowGraph.off('graph:showContextPad', showContextPad);
        flowGraph.off('graph:hideContextPad', hideContextPad);
        flowGraph.off('model:change', handleModelChange);
      }
    };
  }, [flowGraph]);

  return (
    // @ts-ignore
    <GraphContext.Provider // @ts-ignore
      value={{ graph: flowGraph, graphWrapper: wrapperRef, model: null }}
    >
      <Layout
        flowGraph={flowGraph}
        SideBar={SideBar}
        ToolBar={ToolBar}
        SettingBar={SettingBar}
      >
        <div className={styles.liteflowEditorContainer} ref={wrapperRef}>
          <div className={styles.liteflowEditorGraph} ref={graphRef} />
          <div className={styles.liteflowEditorMiniMap} ref={miniMapRef} />
          {flowGraph && <NodeEditorModal flowGraph={flowGraph} />}
          {flowGraph && (
            <FlowGraphContextMenu {...contextMenuInfo} flowGraph={flowGraph} />
          )}
          {flowGraph && (
            <FlowGraphContextPad {...contextPadInfo} flowGraph={flowGraph} />
          )}
        </div>
      </Layout>
    </GraphContext.Provider>
  );
};

export default LiteFlowEditor;
