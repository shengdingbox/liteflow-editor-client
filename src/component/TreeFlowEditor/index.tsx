import React, { useRef, useState, useEffect } from 'react';
import { Graph, Edge } from '@antv/x6';
import createFlowChart from './graph/createFlowChart';
import './buildinNodes';
import GraphContext from './context/GraphContext';
import Layout from './panels/layout';
import styles from './index.module.less';
import '@antv/x6/dist/x6.css';
import { NodeComp, NodeData } from './types/node';
import { Store, createStore } from './store/Store';

interface IProps {
  onReady?: (graph: Graph) => void;
  initSchema?: NodeData;
  saveSchema?: (data: NodeData) => Promise<void>;
  compGroups: Array<[string, NodeComp[]]>;
}

const defaultSchema = {
  type: 'buildin/start',
  children: [
    { type: 'buildin/common', props: { node: 'a' } },
    { type: 'buildin/common', props: { node: 'b' } },
    { type: 'buildin/common', props: { node: 'c' } },
  ],
};

const LiteFlowEditor: React.FC<IProps> = (props) => {
  const { onReady, initSchema = defaultSchema } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [flowGraph, setFlowChart] = useState<Graph>();
  const [store, setStore] = useState<Store>();

  useEffect(() => {
    if (graphRef.current && miniMapRef.current) {
      const flowGraph = createFlowChart(
        graphRef.current,
        miniMapRef.current,
        initSchema,
      );
      onReady?.(flowGraph);
      fetchData(flowGraph);
      setFlowChart(flowGraph);
      setStore(createStore(initSchema));
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
    <GraphContext.Provider value={{ graph: flowGraph, store }}>
      <Layout>
        <div className={styles.liteflowEditorContainer} ref={wrapperRef}>
          <div className={styles.liteflowEditorGraph} ref={graphRef} />
          <div className={styles.liteflowEditorMiniMap} ref={miniMapRef} />
        </div>
      </Layout>
    </GraphContext.Provider>
  );
};

export default LiteFlowEditor;
