import React, { useState, useEffect, useReducer } from 'react';
import { Graph } from '@antv/x6';
import { Tabs } from 'antd';
import Basic from './basic';
import {
  ComponentPropertiesEditor,
  ConditionPropertiesEditor,
} from './properties';
import ELNode from '../../model/node';
import NodeOperator from '../../model/el/node-operator';
import styles from './index.module.less';

const { TabPane } = Tabs;

interface IProps {
  flowGraph: Graph;
}

const SettingBar: React.FC<IProps> = (props) => {
  const { flowGraph } = props;

  const [selectedModel, setSelectedModel] = useState<ELNode | null>(null);

  const forceUpdate = useReducer((n) => n + 1, 0)[1];

  useEffect(() => {
    const handler = () => {
      setSelectedModel(null);
      forceUpdate();
    };
    const handleSelect = (component: ELNode) => {
      setSelectedModel(component);
    };
    flowGraph.on('settingBar:forceUpdate', handler);
    flowGraph.off('blank:mousedown', handler);
    flowGraph.on('model:select', handleSelect);
    return () => {
      flowGraph.off('settingBar:forceUpdate', handler);
      flowGraph.off('blank:mousedown', handler);
      flowGraph.off('model:select', handleSelect);
    };
  }, [flowGraph, setSelectedModel, forceUpdate]);

  const nodes = flowGraph.getSelectedCells().filter((v) => !v.isEdge());
  if (selectedModel || nodes.length === 1) {
    let currentModel = selectedModel || nodes[0].getData().model;
    currentModel = currentModel.proxy || currentModel;
    if (Object.getPrototypeOf(currentModel) === NodeOperator.prototype) {
      return (
        <div className={styles.liteflowEditorSettingBarContainer}>
          <Tabs
            tabBarGutter={0}
            defaultActiveKey={'componentProperties'}
            tabBarStyle={{
              display: 'flex',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TabPane tab={'组件属性'} key={'componentProperties'}>
              <ComponentPropertiesEditor model={currentModel} />
            </TabPane>
          </Tabs>
        </div>
      );
    }
    return (
      <div className={styles.liteflowEditorSettingBarContainer}>
        <Tabs
          tabBarGutter={0}
          defaultActiveKey={'conditionProperties'}
          tabBarStyle={{
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TabPane tab={'节点属性'} key={'conditionProperties'}>
            <ConditionPropertiesEditor model={currentModel} />
          </TabPane>
        </Tabs>
      </div>
    );
  }

  return (
    <div className={styles.liteflowEditorSettingBarContainer}>
      <Tabs
        tabBarGutter={0}
        defaultActiveKey={'basic'}
        tabBarStyle={{
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TabPane tab={'属性'} key={'basic'}>
          <Basic flowGraph={flowGraph} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default SettingBar;
