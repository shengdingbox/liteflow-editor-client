import React, { useEffect, useState } from 'react';
import { Graph, Cell } from '@antv/x6';
import { Select } from 'antd';
import { forceLayout } from '../../../common/layout';
import mocks from '../../../mock';
import newMocks from '../../../mock/mock';
import builder from '../../../model/builder';
import styles from './index.module.less';
import { ConditionTypeEnum } from '../../../constant';
import { toGraphJson } from '@/component/ProFlowEditor/model/model';

interface IProps {
  flowGraph: Graph;
}

const Basic: React.FC<IProps> = (props) => {
  const { flowGraph } = props;

  const [selectedValue, setSelectedValue] = useState<string>(
    // 'cust',
    ConditionTypeEnum.THEN,
  );
  const [elString, setELString] = useState<string>('');

  function getCustCells(): Cell[] {
    return [];
    //    return [];
  }

  const handleOnChange = (value: string = selectedValue) => {
    let modelJSON: Cell[];
    if (value === 'cust') {
      modelJSON = getCustCells();
      setELString('CUST');

      flowGraph.scroller.disableAutoResize();
      flowGraph.startBatch('update');
      flowGraph.fromJSON(modelJSON);
      forceLayout(flowGraph);
      flowGraph.stopBatch('update');
    } else if (value === 'THEN' || value === 'WHEN' || value === 'WHILE') {
      const mockData = newMocks[value];
      modelJSON = toGraphJson(mockData);

      setELString('toGraphJson');

      flowGraph.scroller.disableAutoResize();
      flowGraph.startBatch('update');
      flowGraph.fromJSON(modelJSON);
      forceLayout(flowGraph);
      flowGraph.stopBatch('update');
    } else {
      const mockData = mocks[value] as any;
      const model = builder(mockData);
      modelJSON = model.toCells() as Cell[];
      console.log('=====modeJSON 2', modelJSON);

      setELString(model.toEL());

      flowGraph.scroller.disableAutoResize();
      flowGraph.startBatch('update');
      flowGraph.resetCells(modelJSON);
      forceLayout(flowGraph);
      flowGraph.stopBatch('update');
    }

    const json = flowGraph.toJSON();
    console.log('===== before auto resize', json);
    console.log(
      '====str',
      JSON.stringify(json, (key, value) => {
        if (key === 'data') {
          return null;
        }
        return value;
      }),
    );
    flowGraph.scroller.enableAutoResize();

    setSelectedValue(value);
  };

  useEffect(() => {
    handleOnChange();
  }, []);

  useEffect(() => {
    flowGraph.on('model:change', handleOnChange);
    return () => {
      flowGraph.off('model:change', handleOnChange);
    };
  }, [flowGraph, handleOnChange]);

  return (
    <div className={styles.liteflowEditorBasicContainer}>
      <Select
        value={selectedValue}
        style={{ width: 200 }}
        onChange={handleOnChange}
        options={[
          { label: '自定义', value: 'cust' },
          {
            label: '顺序类',
            options: [
              { label: '串行编排(THEN)', value: ConditionTypeEnum.THEN },
              { label: '并行编排(WHEN)', value: ConditionTypeEnum.WHEN },
            ],
          },
          {
            label: '分支类',
            options: [
              {
                label: '选择编排(SWITCH)',
                value: ConditionTypeEnum.SWITCH,
              },
              { label: '条件编排(IF)', value: ConditionTypeEnum.IF },
            ],
          },
          {
            label: '循环类',
            options: [
              { label: 'FOR循环', value: ConditionTypeEnum.FOR },
              { label: 'WHILE循环', value: ConditionTypeEnum.WHILE },
            ],
          },
        ]}
      />
      <div className={styles.elContentWrapper}>{elString}</div>
    </div>
  );
};

export default Basic;
