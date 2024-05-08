import React, { useRef, useCallback } from 'react';
import { Input } from 'antd';
import { Edge, Node, Graph } from '@antv/x6';
import useClickAway from '../../../hooks/useClickAway';
import {
  NODE_GROUP,
  SEQUENCE_GROUP,
  BRANCH_GROUP,
  CONTROL_GROUP,
} from '../../../cells';
import { ELBuilder } from '../../../model/builder';
import styles from './index.module.less';

export type IContextPadScene = 'append' | 'prepend' | 'replace';

interface IProps {
  x: number;
  y: number;
  edge?: Edge;
  node?: Node;
  scene?: IContextPadScene;
  title?: string;
  visible: boolean;
  flowGraph: Graph;
}

const groups = [NODE_GROUP, SEQUENCE_GROUP, BRANCH_GROUP, CONTROL_GROUP];

const FlowChartContextPad: React.FC<IProps> = (props) => {
  const menuRef = useRef(null);
  const {
    x,
    y,
    visible,
    flowGraph,
    edge,
    node,
    scene = 'append',
    title = '插入节点',
  } = props;

  useClickAway(() => onClickAway(), menuRef);

  const onClickAway = useCallback(
    () => flowGraph.trigger('graph:hideContextPad'),
    [flowGraph],
  );
  const onClickMenu = useCallback(
    (cellType) => {
      if (edge) {
        flowGraph.trigger('graph:addNodeOnEdge', {
          edge,
          node: { shape: cellType.type },
        });
      } else if (node) {
        const { model } = node.getData() || {};
        if (scene === 'prepend') {
          model.prepend(ELBuilder.createELNode(cellType.type, model));
        } else if (scene === 'replace') {
          model.replace(ELBuilder.createELNode(cellType.type, model));
        } else {
          model.append(ELBuilder.createELNode(cellType.type, model));
        }
        flowGraph.trigger('model:change');
      }

      onClickAway();
    },
    [flowGraph, edge, node],
  );

  return !visible ? null : (
    <div
      ref={menuRef}
      className={styles.liteflowEditorContextPad}
      style={{ left: x, top: y }}
    >
      <div className={styles.liteflowEditorContextPadHeader}>
        <h3 className={styles.liteflowEditorContextPadTitle}>{title}</h3>
      </div>
      <div className={styles.liteflowEditorContextPadBody}>
        <div className={styles.liteflowEditorContextPadSearch}>
          <Input.Search placeholder="" />
        </div>
        <div className={styles.liteflowEditorContextPadResults}>
          {groups.map((group) => (
            <div
              key={group.key}
              className={styles.liteflowEditorContextPadGroup}
            >
              <div className={styles.liteflowEditorContextPadGroupName}>
                {group.name}
              </div>
              <div className={styles.liteflowEditorContextPadGroupItems}>
                {group.cellTypes.map((cellType, index) => (
                  <div
                    key={index}
                    className={styles.liteflowEditorContextPadGroupItem}
                    onClick={() => {
                      onClickMenu(cellType);
                    }}
                  >
                    <img
                      className={styles.liteflowEditorContextPadGroupItemIcon}
                      src={cellType.icon}
                    />
                    <div
                      className={styles.liteflowEditorContextPadGroupItemLabel}
                    >
                      {cellType.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlowChartContextPad;
