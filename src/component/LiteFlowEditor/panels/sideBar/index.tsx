import React, { useState, useEffect, useMemo } from 'react';
import { Collapse } from 'antd';
import { Addon, Edge, Graph, Node } from '@antv/x6';
import classNames from 'classnames';
import {
  NODE_GROUP,
  SEQUENCE_GROUP,
  BRANCH_GROUP,
  CONTROL_GROUP,
} from '../../cells';
import { Dnd } from '@antv/x6/lib/addon';
import { View } from '../../cells';
import { findViewsFromPoint } from '../flowChart/createFlowChart';
import { ConditionTypeEnum, NodeTypeEnum } from '../../constant';
import styles from './index.module.less';

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
              case ConditionTypeEnum.TYPE_WHEN:
                targetParent.children.splice(targetIndex, 0, {
                  type: ConditionTypeEnum.TYPE_WHEN,
                  children: [
                    {
                      type: NodeTypeEnum.COMMON,
                      id: `common${Math.ceil(Math.random() * 100)}`,
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case NodeTypeEnum.SWITCH:
                targetParent.children.splice(targetIndex, 0, {
                  type: ConditionTypeEnum.TYPE_SWITCH,
                  condition: {
                    type: NodeTypeEnum.SWITCH,
                    id: `x${Math.ceil(Math.random() * 100)}`,
                  },
                  children: [
                    {
                      type: NodeTypeEnum.COMMON,
                      id: `common${Math.ceil(Math.random() * 100)}`,
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case NodeTypeEnum.IF:
                targetParent.children.splice(targetIndex, 0, {
                  type: ConditionTypeEnum.TYPE_IF,
                  condition: {
                    type: NodeTypeEnum.IF,
                    id: `x${Math.ceil(Math.random() * 100)}`,
                  },
                  children: [
                    {
                      type: NodeTypeEnum.COMMON,
                      id: `common${Math.ceil(Math.random() * 100)}`,
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case NodeTypeEnum.FOR:
                targetParent.children.splice(targetIndex, 0, {
                  type: ConditionTypeEnum.TYPE_FOR,
                  condition: {
                    type: NodeTypeEnum.FOR,
                    id: `x${Math.ceil(Math.random() * 100)}`,
                  },
                  children: [
                    {
                      type: ConditionTypeEnum.TYPE_THEN,
                      children: [
                        {
                          type: NodeTypeEnum.COMMON,
                          id: `common${Math.ceil(Math.random() * 100)}`,
                        },
                      ],
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case NodeTypeEnum.WHILE:
                targetParent.children.splice(targetIndex, 0, {
                  type: ConditionTypeEnum.TYPE_WHILE,
                  condition: {
                    type: NodeTypeEnum.WHILE,
                    id: `x${Math.ceil(Math.random() * 100)}`,
                  },
                  children: [
                    {
                      type: ConditionTypeEnum.TYPE_THEN,
                      children: [
                        {
                          type: NodeTypeEnum.COMMON,
                          id: `common${Math.ceil(Math.random() * 100)}`,
                        },
                      ],
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              case NodeTypeEnum.COMMON:
                targetParent.children.splice(targetIndex, 0, {
                  type: ConditionTypeEnum.TYPE_THEN,
                  children: [
                    {
                      type: NodeTypeEnum.COMMON,
                      id: `common${Math.ceil(Math.random() * 100)}`,
                    },
                  ],
                });
                flowChart.trigger('model:change');
                break;
              default:
                targetParent.children.splice(targetIndex, 0, {
                  type: NodeTypeEnum.COMMON,
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
    setGroups([NODE_GROUP, SEQUENCE_GROUP, BRANCH_GROUP, CONTROL_GROUP]);
  }, []);

  return (
    <div className={styles.liteflowEditorSideBarContainer}>
      <Collapse
        className={styles.liteflowEditorSideBarCollapse}
        defaultActiveKey={['node', 'sequence', 'branch', 'control']}
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
    <div className={styles.liteflowEditorSideBarPanelContent}>
      {cellTypes.map((cellType, index) => {
        return (
          <div
            key={index}
            className={classNames(styles.liteflowEditorSideBarCellContainer, {
              [styles.disabled]: cellType.disabled,
            })}
          >
            <div className={styles.liteflowEditorSideBarCellWrapper}>
              <View
                icon={cellType.icon}
                onMouseDown={(evt: any) => {
                  if (!cellType.disabled) {
                    onMouseDown(evt, cellType.type);
                  }
                }}
              />
            </div>
            <p className={styles.liteflowEditorSideBarCellTitle}>
              {cellType.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default SideBar;
