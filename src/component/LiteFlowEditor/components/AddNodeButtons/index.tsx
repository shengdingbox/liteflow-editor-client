import classNames from 'classnames';
import { debounce } from 'lodash';
import styles from './index.module.less';

const AddNodeButtons: React.FC<any> = (props) => {
  const { node } = props;
  const addNodeOnEdge = ({ clientX, clientY, targetEdges }: any) => {
    if (targetEdges.length) {
      node.model?.graph.trigger('graph:showContextPad', {
        x: clientX,
        y: clientY,
        edge: targetEdges[0],
      });
    }
  };
  const onPrepend = debounce(({ clientX, clientY }: any) => {
    const targetEdges =
      node.model?.getIncomingEdges(node) ||
      node.model?.getOutgoingEdges(node) ||
      [];
    addNodeOnEdge({ clientX, clientY, targetEdges });
  }, 100);
  const onAppend = debounce(({ clientX, clientY }: any) => {
    const targetEdges =
      node.model?.getOutgoingEdges(node) ||
      node.model?.getIncomingEdges(node) ||
      [];
    addNodeOnEdge({ clientX, clientY, targetEdges });
  }, 100);
  return (
    <div className={classNames(styles.liteflowAddNodeButtons)}>
      <div
        className={classNames(styles.liteflowAddNodePrepend)}
        onClick={onPrepend}
      >
        <div className={classNames(styles.liteflowAddNodePrependIcon)}></div>
      </div>
      <div
        className={classNames(styles.liteflowAddNodeAppend)}
        onClick={onAppend}
      >
        <div className={classNames(styles.liteflowAddNodeAppendIcon)}></div>
      </div>
    </div>
  );
};

export default AddNodeButtons;
