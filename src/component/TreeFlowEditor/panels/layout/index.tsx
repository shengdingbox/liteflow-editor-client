import React from 'react';
import { Graph } from '@antv/x6';
import SplitPane from 'react-split-pane-v2';

import SideBar from '../sideBar';
import ToolBar from '../toolBar';
import SettingBar from '../settingBar';
import styles from './index.module.less';
import { useGraph } from '../../hooks';

interface IProps {}

const Layout: React.FC<IProps> = (props) => {
  const { children } = props;

  let sideBar, toolBar, settingBar;
  sideBar = <SideBar />;
  toolBar = <ToolBar />;
  settingBar = <SettingBar />;

  return (
    <div className={styles.liteflowEditorLayoutContainer}>
      <div className={styles.liteflowEditorToolBar}>{toolBar}</div>
      <SplitPane split="vertical">
        <SplitPane.Pane
          className={styles.liteflowEditorSideBar}
          minSize={'145px'}
          maxSize={'443px'}
          initialSize={'267px'}
        >
          {[sideBar]}
        </SplitPane.Pane>
        {children}
        <SplitPane.Pane
          className={styles.liteflowEditorSideBar}
          minSize={'145px'}
          maxSize={'443px'}
          initialSize={'267px'}
        >
          {[settingBar]}
        </SplitPane.Pane>
      </SplitPane>
    </div>
  );
};

export default Layout;
