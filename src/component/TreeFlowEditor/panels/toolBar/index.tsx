import React, { useEffect, useReducer } from 'react';
import { Graph } from '@antv/x6';
import widgets from './widgets';
import { useGraph } from '../../hooks';
import styles from './index.module.less';
import { useGrapher } from '../../hooks/useGraph';

interface IProps {}

const ToolBar: React.FC<IProps> = () => {
  const grapher = useGrapher();
  const forceUpdate = useReducer((n) => n + 1, 0)[1];
  // console.log('===flowGraph', flowGraph);

  useEffect(() => {
    if (!grapher.isReady()) {
      return;
    }
    grapher.flowGraph.on('toolBar:forceUpdate', forceUpdate);
    return () => {
      grapher.flowGraph.off('toolBar:forceUpdate');
    };
  }, [grapher]);

  if (!grapher.isReady()) {
    return null;
  }

  return (
    <div className={styles.liteflowEditorToolBarContainer}>
      {widgets.map((group, index) => (
        <div key={index} className={styles.liteflowEditorToolBarGroup}>
          {group.map((ToolItem, index) => {
            return <ToolItem key={index} grapher={grapher} />;
          })}
        </div>
      ))}
    </div>
  );
};

export default ToolBar;
