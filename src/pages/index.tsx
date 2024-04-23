import * as React from 'react';
import LiteFlowEditor from '../component/LiteFlowEditor';
import styles from './index.less';

const onSave = (data: { nodes: any; edges: any }): void => {
  console.log(data);
};

export default function IndexPage() {
  return (
    <div className={styles.container}>
      <LiteFlowEditor onSave={onSave} />
    </div>
  );
}
