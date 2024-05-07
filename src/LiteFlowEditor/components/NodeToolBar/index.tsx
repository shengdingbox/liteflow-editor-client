import classNames from 'classnames';
import { debounce } from 'lodash';
import { Modal } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const NodeToolBar: React.FC<any> = (props) => {
  const { node } = props;
  const { model } = node.getData() || {};
  const onPrepend = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      node,
      scene: 'prepend',
      edge: undefined,
    });
  }, 100);
  const onAppend = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      node,
      scene: 'append',
      edge: undefined,
    });
  }, 100);
  const onDelete = debounce(() => {
    Modal.confirm({
      title: `确认要删除节点${(model.id && `“${model.id}”`) || ''}？`,
      content: '点击确认按钮进行删除，点击取消按钮返回',
      onOk() {
        if (model.remove()) {
          node.model?.graph.trigger('model:change');
        }
      },
    });
  }, 100);
  return (
    <div className={classNames(styles.liteflowNodeToolBar)}>
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
      <div className={classNames(styles.liteflowDeleteNode)} onClick={onDelete}>
        <CloseCircleOutlined />
      </div>
    </div>
  );
};

export default NodeToolBar;
