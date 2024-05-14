import classNames from 'classnames';
import { debounce } from 'lodash';
import { Modal, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import { useGrapher } from '../../hooks/useGraph';

const NodeToolBar: React.FC<any> = (props) => {
  const grapher = useGrapher();
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
    grapher.store.removeNode(nodeId);
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
