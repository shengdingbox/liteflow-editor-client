import React, { useState, useEffect, useMemo } from 'react';

import 'antd/es/collapse/style';
import styles from './index.module.less';
import { Collapse } from 'antd';
import { Addon, Edge, Graph, Node } from '@antv/x6';
import classNames from 'classnames';
import { NODE_GROUP, BRANCH_GROUP, CONTROL_GROUP } from '../../common/cells';
import { Dnd } from '@antv/x6/lib/addon';
import { View } from '../../common/cells';
import { findViewsFromPoint } from '../flowChart/createFlowChart';
import { parse } from '../../common/model';

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
          const position = droppingNode.getPosition();
          const size = droppingNode.getSize();
          const cellViewsFromPoint = findViewsFromPoint(
            flowChart,
            position.x + size.width / 2,
            position.y + size.height / 2,
          );
          const edgeViews =
            cellViewsFromPoint.filter((cellView) => cellView.isEdgeView()) ||
            [];
          if (edgeViews && edgeViews.length) {
            const currentEdge: Edge = flowChart.getCellById(
              edgeViews[0].cell.id,
            ) as Edge;
            let targetNode = currentEdge.getTargetNode();
            let targetData = targetNode?.getData();
            let targetModel = targetData.model;
            let targetParent = targetData.parent;
            let targetIndex;
            if (!targetParent) {
              targetNode = currentEdge.getSourceNode();
              targetData = targetNode?.getData();
              targetModel = targetData.model;
              targetParent = targetData.parent;
              targetIndex = targetParent.children.indexOf(targetModel) + 1;
            } else {
              targetIndex = targetParent.children.indexOf(targetModel);
            }
            switch (droppingNode.shape) {
              case 'When':
                targetParent.children.splice(targetIndex, 0, {
                  type: 'WHEN',
                  children: [
                    {
                      type: 'CommonComponent',
                      id: `common${Math.ceil(Math.random() * 100)}`,
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case 'SwitchComponent':
                targetParent.children.splice(targetIndex, 0, {
                  type: 'SWITCH',
                  condition: {
                    type: 'SwitchComponent',
                    id: `x${Math.ceil(Math.random() * 100)}`,
                  },
                  children: [
                    {
                      type: 'CommonComponent',
                      id: `common${Math.ceil(Math.random() * 100)}`,
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case 'IfComponent':
                targetParent.children.splice(targetIndex, 0, {
                  type: 'IF',
                  condition: {
                    type: 'IfComponent',
                    id: `x${Math.ceil(Math.random() * 100)}`,
                  },
                  children: [
                    {
                      type: 'CommonComponent',
                      id: `common${Math.ceil(Math.random() * 100)}`,
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case 'ForComponent':
                targetParent.children.splice(targetIndex, 0, {
                  type: 'FOR',
                  condition: {
                    type: 'ForComponent',
                    id: `x${Math.ceil(Math.random() * 100)}`,
                  },
                  children: [
                    {
                      type: 'THEN',
                      children: [
                        {
                          type: 'CommonComponent',
                          id: `common${Math.ceil(Math.random() * 100)}`,
                        },
                      ],
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case 'WhileComponent':
                targetParent.children.splice(targetIndex, 0, {
                  type: 'WHILE',
                  condition: {
                    type: 'WhileComponent',
                    id: `x${Math.ceil(Math.random() * 100)}`,
                  },
                  children: [
                    {
                      type: 'THEN',
                      children: [
                        {
                          type: 'CommonComponent',
                          id: `common${Math.ceil(Math.random() * 100)}`,
                        },
                      ],
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case 'CommonComponent':
              default:
                targetParent.children.splice(targetIndex, 0, {
                  type: 'CommonComponent',
                  id: `common${Math.ceil(Math.random() * 100)}`,
                });
                flowChart.trigger('model:change');
            }
          }
          return false;
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
        return (
          <div
            key={index}
            className={classNames(styles.cellContainer, {
              [styles.disabled]: cellType.disabled,
            })}
          >
            <div className={styles.cellWrapper}>
              <View
                icon={cellType.icon}
                onMouseDown={(evt: any) => {
                  if (!cellType.disabled) {
                    onMouseDown(evt, cellType.type);
                  }
                }}
              />
            </div>
            <p className={styles.cellTitle}>{cellType.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SideBar;
