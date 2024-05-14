import React, { useEffect, useReducer } from 'react';
import { Graph } from '@antv/x6';
import { Tabs } from 'antd';
import Basic from './basic';
import styles from './index.module.less';
import { useGraph } from '../../hooks';

const { TabPane } = Tabs;

interface IProps {}

const SettingBar: React.FC<IProps> = (props) => {
  const flowGraph = useGraph();
  const forceUpdate = useReducer((n) => n + 1, 0)[1];

  useEffect(() => {
    if (!flowGraph) {
      return;
    }
    flowGraph.on('settingBar:forceUpdate', forceUpdate);
    return () => {
      flowGraph.off('settingBar:forceUpdate');
    };
  }, [flowGraph]);

  return (
    <div className={styles.liteflowEditorSettingBarContainer}>
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
        <TabPane tab={'测试'} key={'basic'}></TabPane>
      </Tabs>
    </div>
  );
};

export default SettingBar;
