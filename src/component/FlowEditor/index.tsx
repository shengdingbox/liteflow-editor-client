import React, { useState } from 'react';

import './index.less';
import '@antv/x6/dist/x6.css';

import { Graph } from '@antv/x6';
import Layout from './mods/layout';
import SideBar from './mods/sideBar';
import ToolBar from './mods/toolBar';
import FlowChart from './mods/flowChart';
import SettingBar from './mods/settingBar';

interface IProps {
  onSave: (data: { nodes: any; edges: any }) => void;
}
const FlowEditor: React.FC<IProps> = (props) => {
  const { onSave } = props;
  const [flowChart, setFlowChart] = useState<Graph>();
  const onFlowChartReady = (flowChart: Graph): void => setFlowChart(flowChart);
  return (
    <Layout
      flowChart={flowChart}
      SideBar={SideBar}
      ToolBar={ToolBar}
      SettingBar={SettingBar}
    >
      <FlowChart onReady={onFlowChartReady} />
    </Layout>
  );
};

export default FlowEditor;
