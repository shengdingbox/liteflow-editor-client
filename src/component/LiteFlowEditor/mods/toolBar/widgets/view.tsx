import { EyeOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import React from 'react';
import { Modal } from 'antd';
import JsonView from 'react-json-view';

import makeBtnWidget from './common/makeBtnWidget';

interface IProps {
  flowChart: Graph;
}

const View: React.FC<IProps> = makeBtnWidget({
  tooltip: '查看DSL',
  handler(flowChart: Graph) {
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
          src={flowChart.toJSON()}
        />
      ),
    });
    console.log(JSON.stringify(flowChart.toJSON(), null, 2));
  },
  getIcon() {
    return <EyeOutlined />;
  },
  disabled(flowChart: Graph) {
    return false;
  },
});

export default View;
