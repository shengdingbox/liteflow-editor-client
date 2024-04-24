import React, { useEffect, useReducer } from 'react';
import { Graph } from '@antv/x6';
import widgets from './widgets';
import { useGraph } from '../../hooks';
import styles from './index.module.less';

interface IProps {
  flowChart: Graph;
}

const ToolBar: React.FC<IProps> = () => {
  const flowChart: Graph = useGraph();
  const forceUpdate = useReducer((n) => n + 1, 0)[1];

  useEffect(() => {
    flowChart.on('toolBar:forceUpdate', forceUpdate);
    return () => {
      flowChart.off('toolBar:forceUpdate');
    };
  }, [flowChart]);

  return (
    <div className={styles.liteflowEditorToolBarContainer}>
      {widgets.map((group, index) => (
        <div key={index} className={styles.liteflowEditorToolBarGroup}>
          {group.map((ToolItem, index) => {
            return <ToolItem key={index} flowChart={flowChart} />;
          })}
        </div>
      ))}
    </div>
  );
};

export default ToolBar;
