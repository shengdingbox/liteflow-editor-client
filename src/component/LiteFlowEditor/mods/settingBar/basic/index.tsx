import React, { useEffect, useState } from 'react';
import { Graph } from '@antv/x6';
import { Select } from 'antd';
import { forceLayout } from '../../../utils/flowChartUtils';
import mocks from '../../../utils/mockData';
import render, { toString } from '../../../common/model';
import styles from './index.module.less';

interface IProps {
  flowChart: Graph;
}

const Basic: React.FC<IProps> = (props) => {
  const { flowChart } = props;

  const [selectedValue, setSelectedValue] = useState<string>('THEN');
  const [elString, setELString] = useState<string>('');

  const handleOnChange = (value: string = selectedValue) => {
    const mockData = mocks[value] as any;
    const modelJSON = render(mockData);
    flowChart.startBatch('update');
    flowChart.resetCells(modelJSON);
    forceLayout(flowChart);
    flowChart.stopBatch('update');

    setELString(toString(mockData));
    setSelectedValue(value);
  };

  useEffect(() => {
    handleOnChange('THEN');
  }, []);

  useEffect(() => {
    flowChart.on('model:change', handleOnChange);
    return () => {
      flowChart.off('model:change', handleOnChange);
    };
  }, [flowChart, handleOnChange]);

  return (
    <div className={styles.liteflowEditorBasicContainer}>
      <Select
        value={selectedValue}
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
      <div className={styles.elContentWrapper}>{elString}</div>
    </div>
  );
};

export default Basic;
