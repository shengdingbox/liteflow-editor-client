import React from 'react';
import { Graph } from '@antv/x6';
import SplitPane from 'react-split-pane-v2';
import styles from './index.module.less';

const Pane = SplitPane.Pane;

interface ISubComponentProps {
  flowGraph: Graph;
}

interface IProps {
  flowGraph: Graph | undefined;
  SideBar: React.FC<ISubComponentProps>;
  ToolBar: React.FC<ISubComponentProps>;
  SettingBar: React.FC<ISubComponentProps>;
}

const Layout: React.FC<IProps> = (props) => {
  const { flowGraph, SideBar, ToolBar, SettingBar } = props;

  let sideBar, toolBar, settingBar;
  if (flowGraph) {
    sideBar = <SideBar flowGraph={flowGraph} />;
    toolBar = <ToolBar flowGraph={flowGraph} />;
    settingBar = <SettingBar flowGraph={flowGraph} />;
  }

  return (
    <div className={styles.liteflowEditorLayoutContainer}>
      <div className={styles.liteflowEditorToolBar}>{toolBar}</div>
      <SplitPane split={'vertical'}>
        <Pane
          className={styles.liteflowEditorSideBar}
          minSize={'145px'}
          maxSize={'443px'}
          initialSize={'267px'}
        >
          {sideBar}
        </Pane>
        <SplitPane split={'horizontal'}>
          {props.children}
          <Pane
            className={styles.liteflowEditorSettingBar}
            minSize={'50px'}
            maxSize={'500px'}
            initialSize={'200px'}
          >
            {settingBar}
          </Pane>
        </SplitPane>
      </SplitPane>
    </div>
  );
};

export default Layout;
