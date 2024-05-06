import React, { useEffect, useReducer } from 'react';
import { Graph } from '@antv/x6';
import { Tabs } from 'antd';
import Basic from './basic';
import styles from './index.module.less';

const { TabPane } = Tabs;

interface IProps {
  flowGraph: Graph;
}

const SettingBar: React.FC<IProps> = (props) => {
  const { flowGraph } = props;
  const forceUpdate = useReducer((n) => n + 1, 0)[1];

  useEffect(() => {
    flowGraph.on('settingBar:forceUpdate', forceUpdate);
    return () => {
      flowGraph.off('settingBar:forceUpdate');
    };
  }, []);

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
        <TabPane tab={'测试'} key={'basic'}>
          <Basic flowGraph={flowGraph} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingBar;
