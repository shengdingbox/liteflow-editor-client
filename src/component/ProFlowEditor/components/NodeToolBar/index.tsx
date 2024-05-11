import classNames from 'classnames';
import { debounce } from 'lodash';
import { Modal, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const NodeToolBar: React.FC<any> = (props) => {
  const { node } = props;
  const nodeId = node.id;
  console.log('node', node);
  const {
    model,
    toolbar = {
      append: false,
      delete: false,
      prepend: false,
      replace: false,
    },
  } = node.getData() || {};
  const onPrepend = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      node,
      scene: 'prepend',
      title: '前面插入节点',
      edge: null,
    });
  }, 100);
  const onAppend = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      node,
      scene: 'append',
      title: '后面插入节点',
      edge: null,
    });
  }, 100);
  const onReplace = debounce(({ clientX, clientY }: any) => {
    node.model?.graph.trigger('graph:showContextPad', {
      x: clientX,
      y: clientY,
      node,
      scene: 'replace',
      title: '替换当前节点',
      edge: null,
    });
  }, 100);
  const onDelete = debounce(() => {
    Modal.confirm({
      title: `确认要删除节点${nodeId}？`,
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
      {toolbar.prepend && (
        <div
          className={classNames(styles.liteflowAddNodePrepend)}
          onClick={onPrepend}
        >
          <Tooltip title="前面插入节点">
            <div
              className={classNames(styles.liteflowAddNodePrependIcon)}
            ></div>
          </Tooltip>
        </div>
      )}
      {toolbar.append && (
        <div
          className={classNames(styles.liteflowAddNodeAppend)}
          onClick={onAppend}
        >
          <Tooltip title="后面插入节点">
            <div className={classNames(styles.liteflowAddNodeAppendIcon)}></div>
          </Tooltip>
        </div>
      )}
      {(toolbar.replace || toolbar.delete) && (
        <div className={classNames(styles.liteflowTopToolBar)}>
          {toolbar.replace && (
            <div
              className={classNames(styles.liteflowToolBarBtn)}
              onClick={onReplace}
            >
              <Tooltip title="替换当前节点">
                <EditOutlined />
              </Tooltip>
            </div>
          )}
          {toolbar.delete && (
            <div
              className={classNames(
                styles.liteflowToolBarBtn,
                styles.liteflowDeleteNode,
              )}
              onClick={onDelete}
            >
              <Tooltip title="删除节点">
                <DeleteOutlined />
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeToolBar;
