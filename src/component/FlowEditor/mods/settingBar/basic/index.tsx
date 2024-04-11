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
      <Select
        defaultValue={'THEN'}
        style={{ width: 200 }}
        onChange={handleOnChange}
        options={[
          {
            label: '顺序类',
            options: [
              { label: '串行编排(THEN)', value: 'THEN' },
              { label: '并行编排(WHEN)', value: 'WHEN' },
            ],
          },
          {
            label: '分支类',
            options: [
              { label: '选择编排(SWITCH)', value: 'SWITCH' },
              { label: '条件编排(IF)', value: 'IF' },
            ],
          },
          {
            label: '循环类',
            options: [
              { label: 'FOR循环', value: 'FOR' },
              { label: 'WHILE循环', value: 'WHILE' },
            ],
          },
        ]}
      />
      <div className={styles.elContentWrapper}>THEN(a, b, c, d)</div>
    </div>
  );
};

export default Basic;
