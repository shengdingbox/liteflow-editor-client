import React from 'react';
import { Node } from '@antv/x6';
import classNames from 'classnames';

import styles from './index.module.less';

const NodeView: React.FC<{ icon: string; node: Node }> = (props) => {
  const { icon, children } = props;
  return (
    <div className={classNames(styles.liteflowShapeWrapper)}>
      <img className={styles.liteflowShapeSvg} src={icon}></img>
      { children }
    </div>
  );
};

export default NodeView;
