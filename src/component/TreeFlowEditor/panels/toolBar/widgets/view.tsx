import { EyeOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import React from 'react';
import { Modal } from 'antd';
import JsonView from 'react-json-view';
import { Grapher } from '../../../context/GraphContext';
import makeBtnWidget from './common/makeBtnWidget';

interface IProps {
  grapher: Grapher;
}

const View: React.FC<IProps> = makeBtnWidget({
  tooltip: '查看DSL',
  handler(grapher: Grapher) {
    Modal.info({
      title: '查看DSL',
      width: 1000,
      maskClosable: true,
      closable: true,
      content: (
        <JsonView
          name={null}
          collapsed={false}
          enableClipboard={true}
          displayDataTypes={false}
          displayObjectSize={false}
          src={grapher.store.document.data}
          collapsed={2}
        />
      ),
    });
  },
  getIcon() {
    return <EyeOutlined />;
  },
  disabled(grapher: Grapher) {
    return false;
  },
});

export default View;
