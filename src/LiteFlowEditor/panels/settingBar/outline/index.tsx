import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Graph } from '@antv/x6';
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useModel } from '../../../hooks/useModel';
import ELNode from '../../../model/node';
import styles from './index.module.less';
import { DownOutlined } from '@ant-design/icons';
import { getIconByType } from '@/LiteFlowEditor/cells';

interface IProps {
  flowGraph: Graph;
}

const TreeNodeTitle: React.FC<{ model: ELNode }> = ({ model }) => {
  const { id, type } = model;
  return (
    <div className={classNames(styles.liteflowEditorOutlineTitle)}>
      <span>{id ? `${id} : ${type}` : type}</span>
    </div>
  );
};

const Outline: React.FC<IProps> = (props) => {
  const { flowGraph } = props;
  const model = useModel();
  const initialkeys: string[] = [];
  const [treeData, setTreeData] = useState<DataNode[]>(
    model ? [transformer(model, initialkeys)] : [],
  );
  const [expandedKeys, setExpandedKeys] = useState<string[]>(initialkeys);

  function transformer(currentModel: ELNode, keys: string[]): DataNode {
    const key = `${currentModel.type}-${Math.ceil(Math.random() * 1000)}`;
    keys.push(key);
    const node: DataNode = {
      title: <TreeNodeTitle model={currentModel} />,
      key,
      icon: (
        <div className={styles.liteflowEditorOutlineIcon}>
          <img
            className={styles.liteflowEditorOutlineImage}
            src={getIconByType(currentModel.type)}
          />
        </div>
      ),
    };
    node.children = [];
    if (currentModel.condition) {
      node.children.push(transformer(currentModel.condition, keys));
    }
    if (currentModel.children) {
      node.children = node.children.concat(
        currentModel.children.map((item) => transformer(item, keys)),
      );
    }
    return node;
  }

  useEffect(() => {
    const handleModelChange = () => {
      const model = useModel();
      if (model) {
        const keys: string[] = [];
        setTreeData([transformer(model, keys)]);
        setExpandedKeys(keys);
        return;
      }
      setTreeData([]);
    };
    flowGraph.on('model:change', handleModelChange);
    return () => {
      flowGraph.off('model:change', handleModelChange);
    };
  }, [flowGraph, setTreeData]);

  return (
    <div className={styles.liteflowEditorOutlineContainer}>
      <Tree
        blockNode
        showIcon
        showLine
        switcherIcon={<DownOutlined />}
        expandedKeys={expandedKeys}
        selectedKeys={[]}
        treeData={treeData}
      />
    </div>
  );
};

export default Outline;
