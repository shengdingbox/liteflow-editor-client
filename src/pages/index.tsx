import TreeFlowEditor from '../component/TreeFlowEditor';
import { compGroups } from './comps/groups';
import styles from './index.less';
import initSchema from './mocks/demo3.json';

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
