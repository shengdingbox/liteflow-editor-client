import { Graph } from '@antv/x6';
import TreeFlowEditor from '../component/TreeFlowEditor';
import styles from './index.less';
import { compGroups } from './comps/groups';

const initSchema = {
  id: 'start',
  type: 'BUILDIN/START',
  children: [
    {
      id: 'i1r6iz2qd7d',
      type: 'BUILDIN/COMMON',
      props: { node: 'a' },
    },
    {
      id: '3xqfj3psj4r',
      type: 'BUILDIN/COMMON',
      props: { node: 'b' },
    },
    {
      id: '1nq1eu2gl0l',
      type: 'BUILDIN/COMMON',
      props: { node: 'c' },
    },
  ],
};

export default function IndexPage() {
  return (
    <div className={styles.container}>
      <TreeFlowEditor
        initSchema={initSchema}
        compGroups={compGroups}
        onSave={async (data) => {
          console.log('====save data', data);
        }}
      />
    </div>
  );
}
