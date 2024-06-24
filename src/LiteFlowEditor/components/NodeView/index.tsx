import React from 'react';
import { Node } from '@antv/x6';
import classNames from 'classnames';
import NodeToolBar from '../NodeToolBar';
import { NODE_TYPE_INTERMEDIATE_END, NodeTypeEnum, ConditionTypeEnum } from '../../constant';
import { getIconByType } from '../../cells';
import styles from './index.module.less';

const NodeView: React.FC<{ icon: string; node: Node }> = (props) => {
  const { icon, node } = props;
  const { model } = node.getData();
  let badge = null
  if (model) {
    const currentModel = model.proxy || model;
    if (
      currentModel.type !== node.shape &&
      currentModel.type !== NodeTypeEnum.COMMON &&
      currentModel.type !== ConditionTypeEnum.CHAIN &&
      NODE_TYPE_INTERMEDIATE_END !== node.shape
    ) {
      badge = (
        <div className={classNames(styles.liteflowShapeBadgeWrapper)}>
          <img className={styles.liteflowShapeBadgeSvg} src={getIconByType(currentModel.type)}></img>
        </div>
      );
    }
  }
  return (
    <div className={classNames(styles.liteflowShapeWrapper)}>
      { badge }
      <img className={styles.liteflowShapeSvg} src={icon}></img>
      <NodeToolBar node={node} />
    </div>
  );
};

export default NodeView;
