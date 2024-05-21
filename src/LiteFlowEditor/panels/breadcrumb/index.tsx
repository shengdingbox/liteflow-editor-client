import React, { useReducer, useEffect } from 'react';
import { Graph } from '@antv/x6';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import ELNode from '../../model/node';
import { getIconByType } from '../../cells';
import styles from './index.module.less';

interface IProps {
  flowGraph: Graph;
}

const BreadcrumbPath: React.FC<IProps> = (props) => {
  const { flowGraph } = props;

  const forceUpdate = useReducer((n) => n + 1, 0)[1];
  useEffect(() => {
    flowGraph.on('settingBar:forceUpdate', forceUpdate);
    return () => {
      flowGraph.off('settingBar:forceUpdate');
    };
  }, [flowGraph]);

  const nodes = flowGraph.getSelectedCells().filter((v) => !v.isEdge());
  const parents: ELNode[] = [];
  if (nodes.length) {
    const { model } = nodes[0].getData();
    let nextModel = model.proxy || model;
    while (nextModel) {
      if (nextModel.parent) {
        parents.splice(0, 0, nextModel);
      }
      nextModel = nextModel.parent;
    }
  }

  const handleSelectModel = debounce((selectedModel) => {
    flowGraph.trigger('model:select', selectedModel);
  }, 100);

  return (
    <div className={styles.liteflowEditorBreadcrumb}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        {parents.map((elNodeModel: ELNode, index: number) => {
          const icon = getIconByType(elNodeModel.type);
          const handleClick = () => {
            flowGraph.cleanSelection();
            flowGraph.select(elNodeModel.getNodes());
            handleSelectModel(elNodeModel);
          };
          return (
            <Breadcrumb.Item key={index} onClick={handleClick}>
              <img className={styles.liteflowEditorBreadcrumbIcon} src={icon} />
              <span>{elNodeModel.type}</span>
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbPath;
