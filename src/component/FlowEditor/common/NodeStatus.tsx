import React from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { ReactShape } from '@antv/x6-react-shape';
import { INodeStatus } from './cellBase';
import styles from './cellBase.module.less';

interface Props {
  node?: ReactShape;
  status?: INodeStatus;
}

export const NodeStatus: React.FC<Props> = (props) => {
  const { status, node } = props;
  let statusIcon;
  switch (status?.jobStatus) {
    case 'fail':
      statusIcon = (
        <div className={styles.statusIcon}>
          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
        </div>
      );
      break;
    case 'success':
    case 'upChangeSuccess': {
      const color = status?.jobStatus === 'success' ? '#2ecc71' : '#1890ff';
      statusIcon = (
        <div className={styles.statusIcon}>
          <CheckCircleOutlined style={{ color }} />
        </div>
      );
      break;
    }
    case 'running':
      statusIcon = (
        <div className={styles.statusIcon}>
          <SyncOutlined spin={true} style={{ color: '#1890ff' }} />
        </div>
      );
      break;
  }
  return (
    <div className={styles.statusWrapper}>
      {status?.jobStatus && statusIcon}
    </div>
  );
};
