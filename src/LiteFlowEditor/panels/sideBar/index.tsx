import React, { useState, useEffect, useMemo } from 'react';
import { Collapse } from 'antd';
import { Addon, Edge, Graph, Node } from '@antv/x6';
import classNames from 'classnames';
import {
  NODE_GROUP,
  SEQUENCE_GROUP,
  BRANCH_GROUP,
  CONTROL_GROUP,
  IGroupItem,
} from '../../cells';
import { findViewsFromPoint } from '../../common/events';
import ELBuilder from '../../model/builder';
import { INodeData } from '../../model/node';
import styles from './index.module.less';
import { history } from '../../hooks/useHistory';

const { Panel } = Collapse;

interface ISideBarProps {
  flowGraph: Graph;
}

const SideBar: React.FC<ISideBarProps> = (props) => {
  const { flowGraph } = props;
  const [groups, setGroups] = useState<IGroupItem[]>([]);
  const dnd = useMemo(
    () =>
      new Addon.Dnd({
        target: flowGraph,
        scaled: true,
        validateNode: (droppingNode: Node) => {
          const position = droppingNode.getPosition();
          const size = droppingNode.getSize();
          const { node } = droppingNode.getData();
          const cellViewsFromPoint = findViewsFromPoint(
            flowGraph,
            position.x + size.width / 2,
            position.y + size.height / 2,
          );
          let cellViews =
            cellViewsFromPoint.filter((cellView) => cellView.isEdgeView()) ||
            [];
          if (cellViews && cellViews.length) {
            const currentEdge = flowGraph.getCellById(
              cellViews[0].cell.id,
            ) as Edge | null;
            if (currentEdge) {
              flowGraph.trigger('graph:addNodeOnEdge', {
                edge: currentEdge,
                node: { shape: node.type },
              });
            }
          }
          cellViews =
            cellViewsFromPoint.filter((cellView) => cellView.isNodeView()) ||
            [];
          if (cellViews && cellViews.length) {
            const currentNode = flowGraph.getCellById(
              cellViews[0].cell.id,
            ) as Node | null;
            if (currentNode) {
              let { model } = currentNode.getData<INodeData>();
              model?.replace(ELBuilder.createELNode(node.type as any));
              history.push();
            }
          }
          return false;
        },
      }),
    [flowGraph],
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

const View: React.FC<any> = (props) => {
  const { node, icon, ...rest } = props;
  return (
    <div className={classNames(styles.liteflowShapeWrapper)} {...rest}>
      <img className={styles.liteflowShapeSvg} src={icon}></img>
    </div>
  );
};

interface IPanelContentProps {
  dnd: Addon.Dnd;
  cellTypes: LiteFlowNode[];
}

const PanelContent: React.FC<IPanelContentProps> = (props) => {
  const { dnd, cellTypes } = props;
  const onMouseDown = (evt: any, node: LiteFlowNode) => {
    dnd.start(Node.create({ shape: node.shape, data: { node } }), evt);
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
                    onMouseDown(evt, cellType);
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