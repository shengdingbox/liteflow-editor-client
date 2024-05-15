import TreeFlowEditor from '../component/TreeFlowEditor';
import { compGroups } from './comps/groups';
import styles from './index.less';

const initSchema = {
  id: 'start',
  type: 'BUILDIN/START',
  children: [
    {
      id: 'i1r6iz2qd7d',
      type: 'common',
      props: { node: 'a' },
    },
    {
      id: '3xqfj3psj4r',
      type: 'common',
      props: { node: 'b' },
    },
    {
      id: '1nq1eu2gl0l',
      type: 'common',
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
