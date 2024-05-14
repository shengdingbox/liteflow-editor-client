import { Graph } from '@antv/x6';
import { Portal } from '@antv/x6-react-shape';
import React, { useEffect, useRef, useState } from 'react';

import '@antv/x6/dist/x6.css';
import './buildinNodes';
import GraphContext, { Grapher } from './context/GraphContext';
import styles from './index.module.less';
import Layout from './panels/layout';
import { NodeComp, NodeData } from './types/node';

const X6ReactPortalProvider = Portal.getProvider();

interface IProps {
  initSchema?: NodeData;
  onReady?: (graph: Graph) => void;
  onSave?: (data: NodeData) => Promise<void>;
  compGroups?: Array<[string, NodeComp[]]>;
}

const defaultSchema = {
  id: 'start',
  type: 'BUILDIN/START',
  children: [],
};

const LiteFlowEditor: React.FC<IProps> = (props) => {
  const { onReady, initSchema = defaultSchema, onSave, compGroups } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [grapher, setGrapher] = useState<Grapher>(new Grapher());

  useEffect(() => {
    if (graphRef.current && miniMapRef.current) {
      const grapher = new Grapher({
        container: graphRef.current,
        miniMapContainer: miniMapRef.current,
        initSchema,
        onSave,
        compGroups,
      });
      setGrapher(grapher);
      onReady?.(grapher.flowGraph!);
    }
  }, []);

  // resize flowGraph's size when window size changes
  useEffect(() => {
    const handler = () => {
      requestAnimationFrame(() => {
        if (grapher.isReady()) {
          if (grapher.flowGraph && wrapperRef && wrapperRef.current) {
            const width = wrapperRef.current.clientWidth;
            const height = wrapperRef.current.clientHeight;
            grapher.flowGraph.resize(width, height);
          }
        }
      });
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [grapher, wrapperRef]);

  return (
    <GraphContext.Provider value={grapher}>
      <X6ReactPortalProvider />
      <Layout compGroups={compGroups}>
        <div className={styles.liteflowEditorContainer} ref={wrapperRef}>
          <div className={styles.liteflowEditorGraph} ref={graphRef} />
          <div className={styles.liteflowEditorMiniMap} ref={miniMapRef} />
        </div>
      </Layout>
    </GraphContext.Provider>
  );
};

export default LiteFlowEditor;
