import classNames from 'classnames';
import NodeToolBar from '../NodeToolBar';
import styles from './index.module.less';

const NodeView: React.FC<any> = (props) => {
  const { icon, node } = props;
  return (
    <div className={classNames(styles.liteflowShapeWrapper)}>
      <img className={styles.liteflowShapeSvg} src={icon}></img>
      <NodeToolBar node={node} />
    </div>
  );
};

export default NodeView;
