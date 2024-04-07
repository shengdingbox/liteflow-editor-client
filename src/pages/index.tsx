import * as React from 'react';
import FlowEditor from '../component/FlowEditor';
import styles from './index.less';

const onSave = (data: { nodes: any; edges: any }): void => {
  console.log(data);
};

export default function IndexPage() {
  return (
    <div className={styles.container}>
      <FlowEditor onSave={onSave} />
    </div>
  );
}
