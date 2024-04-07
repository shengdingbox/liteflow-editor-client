import React from 'react';

import styles from './index.module.less';

import { Graph } from '@antv/x6';
import SplitPane from 'react-split-pane-v2';

const Pane = SplitPane.Pane;

interface ISubComponentProps {
  flowChart: Graph;
}

interface IProps {
  flowChart: Graph | undefined;
  SideBar: React.FC<ISubComponentProps>;
  ToolBar: React.FC<ISubComponentProps>;
  SettingBar: React.FC<ISubComponentProps>;
}

const Layout: React.FC<IProps> = (props) => {
  const { flowChart, SideBar, ToolBar, SettingBar } = props;

  let sideBar, toolBar, settingBar;
  if (flowChart) {
    sideBar = <SideBar flowChart={flowChart} />;
    toolBar = <ToolBar flowChart={flowChart} />;
    settingBar = <SettingBar flowChart={flowChart} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolBar}>{toolBar}</div>
      <SplitPane split={'vertical'}>
        <SplitPane split={'horizontal'}>
          {props.children}
          <Pane
            className={styles.settingBar}
            minSize={'50px'}
            maxSize={'500px'}
            initialSize={'200px'}
          >
            {settingBar}
          </Pane>
        </SplitPane>
        <Pane
          className={styles.sideBar}
          minSize={'145px'}
          maxSize={'443px'}
          initialSize={'267px'}
        >
          {sideBar}
        </Pane>
      </SplitPane>
    </div>
  );
};

export default Layout;
