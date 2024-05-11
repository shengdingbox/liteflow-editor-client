import React, { useRef, useState, useEffect } from 'react';
import { Graph, Edge } from '@antv/x6';
import createFlowChart from './panels/flowGraph/createFlowChart';
import './buildinNodes';
import NodeEditorModal from './panels/flowGraph/nodeEditorModal';
import GraphContext from './context/GraphContext';
import Layout from './panels/layout';
import styles from './index.module.less';
import '@antv/x6/dist/x6.css';

interface IProps {
  onReady?: (graph: Graph) => void;
}

const LiteFlowEditor: React.FC<IProps> = (props) => {
  const { onReady } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [flowGraph, setFlowChart] = useState<Graph>();

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

  const fetchData = (flowGraph: Graph) => {
    flowGraph.fromJSON({ cells: [] });
  };

  return (
    // @ts-ignore
    <GraphContext.Provider // @ts-ignore
      value={{ graph: flowGraph }}
    >
      <Layout flowGraph={flowGraph}>
        <div className={styles.liteflowEditorContainer} ref={wrapperRef}>
          <div className={styles.liteflowEditorGraph} ref={graphRef} />
          <div className={styles.liteflowEditorMiniMap} ref={miniMapRef} />
          {flowGraph && <NodeEditorModal flowGraph={flowGraph} />}
        </div>
      </Layout>
    </GraphContext.Provider>
  );
};

export default LiteFlowEditor;
