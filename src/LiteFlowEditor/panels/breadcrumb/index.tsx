import React, { useReducer, useEffect } from 'react';
import { Graph } from '@antv/x6';
import ELNode from '../../model/node';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
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

  return (
    <div className={styles.liteflowEditorBreadcrumb}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <HomeOutlined />
        </Breadcrumb.Item>
        {parents.map((elNodeModel: ELNode, index: number) => {
          const icon = getIconByType(elNodeModel.type);
          const handleClick = () => {
            if (parents.length - 1 !== index) {
              flowGraph.trigger('model:select', elNodeModel);
            }
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
