import classNames from 'classnames';
import AddNodeButtons from '../AddNodeButtons';
import styles from './index.module.less';

const NodeView: React.FC<any> = (props) => {
  const { icon, node } = props;
  return (
    <div className={classNames(styles.liteflowShapeWrapper)}>
      <img className={styles.liteflowShapeSvg} src={icon}></img>
      <AddNodeButtons node={node} />
    </div>
  );
};

export default NodeView;
