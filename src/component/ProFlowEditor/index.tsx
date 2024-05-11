import React, { useRef, useState, useEffect } from 'react';
import { Graph, Edge } from '@antv/x6';
import createFlowChart from './panels/flowGraph/createFlowChart';
import NodeEditorModal from './panels/flowGraph/nodeEditorModal';
import FlowChartContextMenu from './panels/flowGraph/contextMenu';
import FlowChartContextPad from './panels/flowGraph/contextPad';
import GraphContext from './context/GraphContext';
import Layout from './panels/layout';
import styles from './index.module.less';
import '@antv/x6/dist/x6.css';

interface IProps {
  onReady?: (graph: Graph) => void;
}

interface IMenuInfo {
  x: number;
  y: number;
  scene: string;
  visible: boolean;
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
  edge: Edge;
  visible: boolean;
}

const defaultPadInfo: IPadInfo = {
  x: 0,
  y: 0,
  edge: Edge.create({}),
  visible: false,
};

const LiteFlowEditor: React.FC<IProps> = (props) => {
  const { onReady } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [flowGraph, setFlowChart] = useState<Graph>();
  const [contextMenuInfo, setContextMenuInfo] =
    useState<IMenuInfo>(defaultMenuInfo);
  const [contextPadInfo, setContextPadInfo] =
    useState<IPadInfo>(defaultPadInfo);

  useEffect(() => {
    if (graphRef.current && miniMapRef.current) {
      const flowGraph = createFlowChart(graphRef.current, miniMapRef.current);
      onReady?.(flowGraph);
      fetchData(flowGraph);
      setFlowChart(flowGraph);
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
    if (flowGraph) {
      flowGraph.on('graph:showContextMenu', showHandler);
      flowGraph.on('graph:hideContextMenu', hideHandler);
      flowGraph.on('graph:showContextPad', showContextPad);
      flowGraph.on('graph:hideContextPad', hideContextPad);
    }
    return () => {
      if (flowGraph) {
        flowGraph.off('graph:showContextMenu', showHandler);
        flowGraph.off('graph:hideContextMenu', hideHandler);
        flowGraph.off('graph:showContextPad', showContextPad);
        flowGraph.off('graph:hideContextPad', hideContextPad);
      }
    };
  }, [flowGraph]);

  const fetchData = (flowGraph: Graph) => {
    flowGraph.fromJSON({ cells: [] });
  };

  return (
    // @ts-ignore
    <GraphContext.Provider // @ts-ignore
      value={{ graph: flowGraph, graphWrapper: wrapperRef, model: null }}
    >
      <Layout flowGraph={flowGraph}>
        <div className={styles.liteflowEditorContainer} ref={wrapperRef}>
          <div className={styles.liteflowEditorGraph} ref={graphRef} />
          <div className={styles.liteflowEditorMiniMap} ref={miniMapRef} />
          {flowGraph && <NodeEditorModal flowGraph={flowGraph} />}
          {flowGraph && (
            <FlowChartContextMenu {...contextMenuInfo} flowGraph={flowGraph} />
          )}
          {/* {flowGraph && (
            <FlowChartContextPad {...contextPadInfo} flowGraph={flowGraph} />
          )} */}
        </div>
      </Layout>
    </GraphContext.Provider>
  );
};

export default LiteFlowEditor;
