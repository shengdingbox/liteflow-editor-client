import classNames from 'classnames';
import { debounce } from 'lodash';
import { Modal, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import styles from './index.module.less';
import { useGrapher } from '../../hooks/useGraph';

const NodeToolBar: React.FC<any> = (props) => {
  const grapher = useGrapher();
  const { node } = props;
  const nodeId = node.id;
  const {
    position,
    toolbar = {
      delete: false,
      prepend: false,
      addMultiple: false,
    },
  } = node.getData() || {};
  const onDelete = debounce(() => {
    grapher.store.removeNode(nodeId, position);
  }, 100);
  const addMultiple = debounce(() => {
    grapher.store.addMultiple(nodeId);
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
          {toolbar.addMultiple && (
            <div
              className={classNames(
                styles.liteflowToolBarBtn,
                styles.liteflowDeleteNode,
              )}
              onClick={addMultiple}
            >
              <Tooltip title="增加分支">
                <PlusOutlined />
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NodeToolBar;
