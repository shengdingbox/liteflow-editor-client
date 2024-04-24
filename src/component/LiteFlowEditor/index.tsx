import React, { useRef, useState, useEffect } from 'react';
import { Graph } from '@antv/x6';
import createFlowChart from './panels/flowChart/createFlowChart';
import NodeEditorModal from './panels/flowChart/nodeEditorModal';
import FlowChartContextMenu from './panels/flowChart/contextMenu';
import FlowChartContextPad from './panels/flowChart/contextPad';
import { Provider } from './context/GraphContext';
import Layout from './panels/layout';
import SideBar from './panels/sideBar';
import ToolBar from './panels/toolBar';
import SettingBar from './panels/settingBar';
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

const defaultMenuInfo = {
  x: 0,
  y: 0,
  scene: 'blank',
  visible: false,
};

const LiteFlowEditor: React.FC<IProps> = (props) => {
  const { onReady } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const miniMapRef = useRef<HTMLDivElement>(null);
  const [flowChart, setFlowChart] = useState<Graph>();
  const [contextMenuInfo, setContextMenuInfo] =
    useState<IMenuInfo>(defaultMenuInfo);
  const [contextPadInfo, setContextPadInfo] =
    useState<IMenuInfo>(defaultMenuInfo);

  useEffect(() => {
    if (graphRef.current && miniMapRef.current) {
      const flowChart = createFlowChart(graphRef.current, miniMapRef.current);
      onReady?.(flowChart);
      fetchData(flowChart);
      setFlowChart(flowChart);
    }
  }, []);

  // resize flowChart's size when window size changes
  useEffect(() => {
    const handler = () => {
      requestAnimationFrame(() => {
        if (flowChart && wrapperRef && wrapperRef.current) {
          const width = wrapperRef.current.clientWidth;
          const height = wrapperRef.current.clientHeight;
          flowChart.resize(width, height);
        }
      });
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, [flowChart, wrapperRef]);

  // NOTE: listen toggling context menu event
  useEffect(() => {
    const showHandler = (info: IMenuInfo) => {
      flowChart?.lockScroller();
      setContextMenuInfo({ ...info, visible: true });
    };
    const hideHandler = () => {
      flowChart?.unlockScroller();
      setContextMenuInfo({ ...contextMenuInfo, visible: false });
    };
    const showContextPad = (info: IMenuInfo) => {
      flowChart?.lockScroller();
      setContextPadInfo({ ...info, visible: true });
    };
    const hideContextPad = () => {
      flowChart?.unlockScroller();
      setContextPadInfo({ ...contextPadInfo, visible: false });
    };
    if (flowChart) {
      flowChart.on('graph:showContextMenu', showHandler);
      flowChart.on('graph:hideContextMenu', hideHandler);
      flowChart.on('graph:showContextPad', showContextPad);
      flowChart.on('graph:hideContextPad', hideContextPad);
    }
    return () => {
      if (flowChart) {
        flowChart.off('graph:showContextMenu', showHandler);
        flowChart.off('graph:hideContextMenu', hideHandler);
        flowChart.off('graph:showContextPad', showContextPad);
        flowChart.off('graph:hideContextPad', hideContextPad);
      }
    };
  }, [flowChart]);

  const fetchData = (flowChart: Graph) => {
    flowChart.fromJSON({ cells: [] });
  };

  return (
    // @ts-ignore
    <Provider
      value={{ graph: flowChart, graphWrapper: wrapperRef, model: null }}
    >
      <Layout
        flowChart={flowChart}
        SideBar={SideBar}
        ToolBar={ToolBar}
        SettingBar={SettingBar}
      >
        <div className={styles.liteflowEditorContainer} ref={wrapperRef}>
          <div className={styles.liteflowEditorGraph} ref={graphRef} />
          <div className={styles.liteflowEditorMiniMap} ref={miniMapRef} />
          {flowChart && <NodeEditorModal flowChart={flowChart} />}
          {flowChart && (
            <FlowChartContextMenu {...contextMenuInfo} flowChart={flowChart} />
          )}
          {flowChart && (
            <FlowChartContextPad {...contextPadInfo} flowChart={flowChart} />
          )}
        </div>
      </Layout>
    </Provider>
  );
};

export default LiteFlowEditor;
