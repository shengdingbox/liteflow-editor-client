import classNames from 'classnames';
import { debounce } from 'lodash';
import { Modal, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import styles from './index.module.less';

const NodeToolBar: React.FC<any> = (props) => {
  const { node } = props;
  const nodeId = node.id;
  const {
    model,
    toolbar = {
      delete: false,
      prepend: false,
    },
  } = node.getData() || {};
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
      {(toolbar.replace || toolbar.delete) && (
        <div className={classNames(styles.liteflowTopToolBar)}>
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
