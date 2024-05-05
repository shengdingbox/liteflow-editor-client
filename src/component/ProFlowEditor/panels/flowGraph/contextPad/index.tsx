import React, { useRef, useCallback } from 'react';
import { Input } from 'antd';
import { Edge, Graph } from '@antv/x6';
import useClickAway from '../../../hooks/useClickAway';
import {
  NODE_GROUP,
  SEQUENCE_GROUP,
  BRANCH_GROUP,
  CONTROL_GROUP,
} from '../../../cells';
import styles from './index.module.less';

interface IProps {
  x: number;
  y: number;
  edge: Edge;
  visible: boolean;
  flowGraph: Graph;
}

const groups = [NODE_GROUP, SEQUENCE_GROUP, BRANCH_GROUP, CONTROL_GROUP];

const FlowChartContextPad: React.FC<IProps> = (props) => {
  const menuRef = useRef(null);
  const { x, y, visible, flowGraph, edge } = props;

  useClickAway(() => onClickAway(), menuRef);

  const onClickAway = useCallback(
    () => flowGraph.trigger('graph:hideContextPad'),
    [flowGraph],
  );
  const onClickMenu = useCallback(
    (cellType) => {
      flowGraph.trigger('graph:addNodeOnEdge', {
        edge,
        node: { shape: cellType.type },
      });
      onClickAway();
    },
    [flowGraph, edge],
  );

  return !visible ? null : (
    <div
      ref={menuRef}
      className={styles.liteflowEditorContextPad}
      style={{ left: x, top: y }}
    >
      <div className={styles.liteflowEditorContextPadHeader}>
        <h3 className={styles.liteflowEditorContextPadTitle}>插入节点</h3>
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
