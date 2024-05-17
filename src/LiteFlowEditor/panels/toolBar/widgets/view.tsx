import { EyeOutlined } from '@ant-design/icons';
import { Graph } from '@antv/x6';
import React from 'react';
import { Modal } from 'antd';
import JsonView from 'react-json-view';

import makeBtnWidget from './common/makeBtnWidget';
import { useModel } from '../../../hooks';

interface IProps {
  flowGraph: Graph;
}

const View: React.FC<IProps> = makeBtnWidget({
  tooltip: '查看DSL',
  handler(flowGraph: Graph) {
    const model = useModel();
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
          src={model.toJSON()}
        />
      ),
    });
    console.log(JSON.stringify(model.toJSON(), null, 2));
  },
  getIcon() {
    return <EyeOutlined />;
  },
  disabled(flowGraph: Graph) {
    return false;
  },
});

export default View;