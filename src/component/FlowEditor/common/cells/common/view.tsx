import React from 'react';
import { ReactShape } from '@antv/x6-react-shape';
import classNames from 'classnames';
import styles from './view.less';
import icon from './icon.svg';

interface IProps extends React.HTMLProps<HTMLDivElement> {
  node?: ReactShape;
}

const Cell: React.FC<IProps> = (props) => {
  const { node, ...rest } = props;
  return (
    <div
      className={classNames(styles.shapeWrapper, styles.eventShape)}
      {...rest}
    >
      <img className={styles.shapeSvg} src={icon}></img>
    </div>
  );
};

export default Cell;
