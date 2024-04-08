import React from 'react';
import { ReactShape } from '@antv/x6-react-shape';
import classNames from 'classnames';
import { IBasicData, INodeStatus } from '../../cellBase';
import { NodeStatus } from '../../NodeStatus';
import styles from './view.less';
import meta from './meta';
import icon from './icon.svg';

interface IProps extends React.HTMLProps<HTMLDivElement> {
  node?: ReactShape;
  status?: INodeStatus;
}

const Cell: React.FC<IProps> = (props) => {
  const { node, status, ...rest } = props;

  return (
    <div
      className={classNames(styles.shapeWrapper, styles.eventShape, {
        [styles.nodeFocus]: status?.isFocus,
      })}
      {...rest}
    >
      <img className={styles.shapeSvg} src={icon}></img>
      <NodeStatus node={node} status={status} />
    </div>
  );
};

export default Cell;
