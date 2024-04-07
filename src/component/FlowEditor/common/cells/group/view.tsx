import React from 'react';
import { ReactShape } from '@antv/x6-react-shape';
import classNames from 'classnames';
import { IBasicData, INodeStatus } from '../../cellBase';
import { NodeStatus } from '../../NodeStatus';
import styles from './view.less';
import icon from './icon.svg';
import iconDefault from './icon-default.svg';
import iconCollapsed from './icon-collapsed.svg';
import GroupNode from './node';

interface IProps extends React.HTMLProps<HTMLDivElement> {
  node?: ReactShape;
  status?: INodeStatus;
}

const Cell: React.FC<IProps> = (props) => {
  const { node, status, ...rest } = props;
  const { collapsed, label, weight } = node?.getData<IBasicData>() || {
    collapsed: true,
  };

  let content = <img className={styles.shapeSvg} src={icon}></img>;
  if (node) {
    content = (
      <div className={styles.groupHeader}>
        <div className={styles.groupHeaderInner}>
          <div className={styles.groupTitle}>{label}</div>
          <div
            className={styles.toggleIconWrapper}
            onClick={(node as GroupNode)?.toggleCollapse.bind(node)}
          >
            <img
              className={styles.toggleIcon}
              src={collapsed ? iconDefault : iconCollapsed}
            ></img>
          </div>
        </div>
        <div className={styles.groupHeaderExtra}>权重: {weight}</div>
      </div>
    );
  }

  return (
    <div
      className={classNames(
        styles.shapeWrapper,
        styles.eventShape,
        styles.groupWrapper,
        {
          [styles.nodeFocus]: status?.isFocus,
          [styles.collapsed]: collapsed,
        },
      )}
      {...rest}
    >
      {content}
      <NodeStatus node={node} status={status} />
    </div>
  );
};

export default Cell;
