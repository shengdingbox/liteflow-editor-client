import classNames from 'classnames';
import { debounce } from 'lodash';
import styles from './index.module.less';

const AddNodeButtons: React.FC<any> = (props) => {
  const { node } = props;
  const onPrepend = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      edge: (node.model?.getIncomingEdges(node) || [])[0],
    });
  }, 100);
  const onAppend = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      edge: (node.model?.getOutgoingEdges(node) || [])[0],
    });
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
