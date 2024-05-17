import React, { useState, useEffect } from 'react';
import { Graph } from '@antv/x6';
import { Select } from 'antd';
import mocks from '../../../mock';
import ELBuilder from '../../../model/builder';
import { ConditionTypeEnum } from '../../../constant';
import { setModel } from '../../../hooks/useModel';
import { history } from '../../../hooks/useHistory';
import styles from './index.module.less';

interface IProps {
  flowGraph: Graph;
}

const Mock: React.FC<IProps> = (props) => {
  const { flowGraph } = props;
  const [selectedValue, setSelectedValue] = useState<string>('');

  const handleOnChange = (value: string) => {
    const mockData = mocks[value] as any;
    const model = ELBuilder.build(mockData || {});
    setModel(model);
    history.cleanHistory();
    setSelectedValue(value);
  };

  useEffect(() => {
    setTimeout(() => {
      handleOnChange(ConditionTypeEnum.THEN);
    }, 500);
  }, [flowGraph]);

  return (
    <div className={styles.zoomContainer} style={{ margin: '0 8px' }}>
      <span>测试数据：</span>
      <Select
        placeholder="请选择测试数据"
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
    </div>
  );
};

export default Mock;