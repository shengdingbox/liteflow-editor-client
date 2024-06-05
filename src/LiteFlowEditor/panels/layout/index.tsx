import React from 'react';
import { Graph } from '@antv/x6';
import SplitPane from 'react-split-pane-v2';
import styles from './index.module.less';
import { useGraphWrapper } from '../../hooks';

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

  const wrapperRef = useGraphWrapper();

  const handleResize = () => {
    if (flowGraph && wrapperRef && wrapperRef.current) {
      const width = wrapperRef.current.clientWidth;
      const height = wrapperRef.current.clientHeight;
      flowGraph.resize(width, height);
    }
  };

  let sideBar, toolBar, settingBar;
  if (flowGraph) {
    sideBar = <SideBar flowGraph={flowGraph} />;
    toolBar = <ToolBar flowGraph={flowGraph} />;
    settingBar = <SettingBar flowGraph={flowGraph} />;
  }

  return (
    <div className={styles.liteflowEditorLayoutContainer}>
      <div className={styles.liteflowEditorToolBar}>{toolBar}</div>
      <SplitPane split={'vertical'} onChange={handleResize}>
        <Pane
          className={styles.liteflowEditorSideBar}
          minSize={'145px'}
          maxSize={'443px'}
          initialSize={'267px'}
        >
          {sideBar}
        </Pane>
        <SplitPane split={'vertical'} onChange={handleResize}>
          {props.children}
          <Pane
            className={styles.liteflowEditorSettingBar}
            minSize={'50px'}
            maxSize={'500px'}
            initialSize={'260px'}
          >
            {settingBar}
          </Pane>
        </SplitPane>
      </SplitPane>
    </div>
  );
};

export default Layout;
