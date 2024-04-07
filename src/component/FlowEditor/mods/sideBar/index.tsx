import React, { useState, useEffect, useMemo } from 'react';

import 'antd/es/collapse/style';
import styles from './index.module.less';
import { Collapse } from 'antd';
import { Addon, Graph, Node } from '@antv/x6';
import classNames from 'classnames';
import { NODE_GROUP, BRANCH_GROUP, CONTROL_GROUP } from '../../common/cells';
import Switch from '../../common/cells/switch';
import SwitchNode from '../../common/cells/switch/node';
import Group from '../../common/cells/group';
import GroupNode from '../../common/cells/group/node';
import { Dnd } from '@antv/x6/lib/addon';

const { Panel } = Collapse;

interface IGroupItem {
  key: string;
  name: string;
  cellTypes: FlowNode[];
}

interface ISideBarProps {
  flowChart: Graph;
}

const SideBar: React.FC<ISideBarProps> = (props) => {
  const { flowChart } = props;
  const [groups, setGroups] = useState<IGroupItem[]>([]);
  const dnd = useMemo(
    () =>
      new Addon.Dnd({
        target: flowChart,
        scaled: true,
        validateNode: (
          droppingNode: Node,
          options: Dnd.ValidateNodeOptions,
        ) => {
          if (droppingNode.shape === Switch.meta.type) {
            return (droppingNode as SwitchNode).validateNode(
              droppingNode,
              options,
            );
          } else if (droppingNode.shape === Group.meta.type) {
            return (droppingNode as GroupNode).validateNode(
              droppingNode,
              options,
            );
          }
          return true;
        },
      }),
    [flowChart],
  );

  // life
  useEffect(() => {
    setGroups([NODE_GROUP, BRANCH_GROUP, CONTROL_GROUP]);
  }, []);

  return (
    <div className={styles.container}>
      <Collapse
        className={styles.collapse}
        defaultActiveKey={['node', 'branch', 'control']}
      >
        {groups.map((group) => (
          <Panel key={group.key} header={group.name}>
            <PanelContent dnd={dnd} cellTypes={group.cellTypes} />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

interface IPanelContentProps {
  dnd: Addon.Dnd;
  cellTypes: FlowNode[];
}

const PanelContent: React.FC<IPanelContentProps> = (props) => {
  const { dnd, cellTypes } = props;
  const onMouseDown = (evt: any, cellType: string) => {
    dnd.start(Node.create({ shape: cellType }), evt);
  };
  return (
    <div className={styles.panelContent}>
      {cellTypes.map((cellType, index) => {
        const Component = cellType.view;
        return (
          <div
            key={index}
            className={classNames(styles.cellContainer, {
              [styles.disabled]: cellType.disabled,
            })}
          >
            <div className={styles.cellWrapper}>
              <Component
                onMouseDown={(evt: any) => {
                  if (!cellType.disabled) {
                    onMouseDown(evt, cellType.meta.type);
                  }
                }}
              />
            </div>
            <p className={styles.cellTitle}>{cellType.meta?.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SideBar;
