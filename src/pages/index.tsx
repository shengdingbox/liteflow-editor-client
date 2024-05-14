import { Graph } from '@antv/x6';
import TreeFlowEditor from '../component/TreeFlowEditor';
import styles from './index.less';

const onReady = (flowGraph: Graph): void => {
  console.log(flowGraph);
};

const initSchema = {
  type: 'buildin/start',
  children: [
    {
      type: 'buildin/common',
      props: {
        node: 'a',
      },
      id: 'i1r6iz2qd7d',
    },
    {
      type: 'buildin/common',
      props: {
        node: 'b',
      },
      id: '3xqfj3psj4r',
    },
    {
      type: 'buildin/common',
      props: {
        node: 'c',
      },
      id: '1nq1eu2gl0l',
    },
  ],
  id: 'deuq00k39gd',
};

export default function IndexPage() {
  return (
    <div className={styles.container}>
      <TreeFlowEditor
        initSchema={initSchema}
        onReady={onReady}
        onSave={async (data) => {
          console.log('====save data', data);
        }}
      />
    </div>
  );
}
