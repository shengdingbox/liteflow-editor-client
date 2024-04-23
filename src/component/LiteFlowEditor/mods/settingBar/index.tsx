import React, { useEffect, useReducer } from 'react';

import 'antd/es/tabs/style';
import 'antd/es/empty/style';
import styles from './index.module.less';

import { Graph } from '@antv/x6';
import { Tabs } from 'antd';
import Basic from './basic';

const { TabPane } = Tabs;

interface IProps {
  flowChart: Graph;
}

const SettingBar: React.FC<IProps> = (props) => {
  const { flowChart } = props;
  const forceUpdate = useReducer((n) => n + 1, 0)[1];

  useEffect(() => {
    flowChart.on('settingBar:forceUpdate', forceUpdate);
    return () => {
      flowChart.off('settingBar:forceUpdate');
    };
  }, []);

  return (
    <div className={styles.container}>
      <Tabs
        tabBarGutter={0}
        defaultActiveKey={'basic'}
        tabBarStyle={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TabPane tab={'测试'} key={'basic'}>
          <Basic flowChart={flowChart} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingBar;
