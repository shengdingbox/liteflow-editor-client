import React, { useEffect, useState } from 'react';
import { Cell, Graph } from '@antv/x6';
import { Select } from 'antd';
import mocks from '../../../mock';
import ELBuilder from '../../../model/builder';
import { ConditionTypeEnum } from '../../../constant';
import { setModel, useModel } from '../../../hooks/useModel';
import { forceLayout } from '../../../common/layout';
import styles from './index.module.less';

interface IProps {
  flowGraph: Graph;
}

const Basic: React.FC<IProps> = (props) => {
  const { flowGraph } = props;

  const [selectedValue, setSelectedValue] = useState<string>(
    ConditionTypeEnum.SWITCH,
  );
  const [elString, setELString] = useState<string>('');

  const handleOnChange = (value: string = selectedValue) => {
    const mockData = mocks[value] as any;
    const model = ELBuilder.build(mockData);
    setModel(model);
    flowGraph.trigger('model:change');
    setELString(model.toEL());
    setSelectedValue(value);
  };

  useEffect(() => {
    const mockData = mocks[selectedValue] as any;
    const model = ELBuilder.build(mockData);
    setModel(model);
    flowGraph.trigger('model:change');
    setELString(model.toEL());

    const modelJSON = model.toCells() as Cell[];
    flowGraph.scroller.disableAutoResize();
    flowGraph.startBatch('update');
    flowGraph.resetCells(modelJSON);
    forceLayout(flowGraph);
    flowGraph.stopBatch('update');
    flowGraph.scroller.enableAutoResize();
  }, [flowGraph, setELString]);

  useEffect(() => {
    const handleModelChange = () => {
      const model = useModel();
      setELString(model.toEL());
    };
    flowGraph.on('model:change', handleModelChange);
    return () => {
      flowGraph.off('model:change', handleModelChange);
    };
  }, [flowGraph, setELString]);

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
