import React, { useEffect } from 'react';
import { Graph } from '@antv/x6';
import { Select } from 'antd';
import { forceLayout } from '../../../utils/flowChartUtils';
import mocks from './mockData';
import render from '../model';
import styles from './index.module.less';

interface IProps {
  flowChart: Graph;
}

const Basic: React.FC<IProps> = (props) => {
  const { flowChart } = props;
  const handleOnChange = (value: string) => {
    const mockData = mocks[value] as any;
    const modelJSON = render(mockData);
    flowChart.fromJSON(modelJSON);
    forceLayout(flowChart);
  };

  useEffect(() => {
    const modelJSON = render(mocks.THEN);
    flowChart.fromJSON(modelJSON);
    forceLayout(flowChart);
  }, []);

  return (
    <div className={styles.container}>
      <Select defaultValue={'THEN'} onChange={handleOnChange}>
        <Select.Option value="THEN">串行编排(THEN)</Select.Option>
        <Select.Option value="WHEN">并行编排(WHEN)</Select.Option>
        <Select.Option value="SWITCH">选择编排(SWITCH)</Select.Option>
        <Select.Option value="IF">条件编排(IF)</Select.Option>
        <Select.Option value="FOR">FOR循环</Select.Option>
        <Select.Option value="WHILE">WHILE循环</Select.Option>
      </Select>
    </div>
  );
};

export default Basic;
