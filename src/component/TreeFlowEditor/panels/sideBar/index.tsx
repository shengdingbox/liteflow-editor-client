import React, { useState, useEffect, useMemo } from 'react';
import { Collapse } from 'antd';
import { Addon, Edge, Graph, Node } from '@antv/x6';
import classNames from 'classnames';
import { findViewsFromPoint } from '../../common/events';
import styles from './index.module.less';
import { NodeComp, NodeData } from '../../types/node';
import { useGraph } from '../../hooks';
import commonIcon from '../../assets/common-icon.svg';
import { useGrapher } from '../../hooks/useGraph';

interface ISideBarProps {
  compGroups?: Array<[string, NodeComp[]]>;
}

const SideBar: React.FC<ISideBarProps> = (props) => {
  const { compGroups } = props;
  const grapher = useGrapher();
  // const [groups, setGroups] = useState<IGroupItem[]>([]);
  const dnd = useMemo(() => {
    if (!grapher.isReady()) {
      // throw new Error('flowGraph is null');
      return null;
    }
    return new Addon.Dnd({
      target: grapher.flowGraph,
      scaled: true,
      validateNode: (droppingNode: Node) => {
        if (grapher.store.currentEdge) {
          grapher.flowGraph.trigger('graph:addNodeOnEdge', {
            edge: grapher.store.currentEdge,
            node: droppingNode,
          });
        }
        return false;
      },
    });
  }, [grapher]);

  // life
  // useEffect(() => {
  //   setGroups([NODE_GROUP, SEQUENCE_GROUP, BRANCH_GROUP, CONTROL_GROUP]);
  // }, []);
  if (!dnd || !compGroups) {
    return null;
  }

  return (
    <div className={styles.liteflowEditorSideBarContainer}>
      <Collapse
        className={styles.liteflowEditorSideBarCollapse}
        defaultActiveKey={compGroups.map((g, i) => i)}
      >
        {compGroups.map((group, i) => (
          <Collapse.Panel key={i} header={group[0]}>
            <PanelContent dnd={dnd} nodeComps={group[1]} />
          </Collapse.Panel>
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
  nodeComps: NodeComp[];
}

const PanelContent: React.FC<IPanelContentProps> = (props) => {
  const { dnd, nodeComps } = props;
  const onMouseDown = (evt: any, node: NodeComp) => {
    dnd.start(Node.create({ data: { node } }), evt);
  };
  return (
    <div className={styles.liteflowEditorSideBarPanelContent}>
      {nodeComps.map((comp, index) => {
        return (
          <div
            key={index}
            className={styles.liteflowEditorSideBarCellContainer}
          >
            <div className={styles.liteflowEditorSideBarCellWrapper}>
              <View
                icon={comp.metadata.icon || commonIcon}
                onMouseDown={(evt: any) => {
                  onMouseDown(evt, comp);
                }}
              />
            </div>
            <p className={styles.liteflowEditorSideBarCellTitle}>
              {comp.metadata.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default SideBar;
