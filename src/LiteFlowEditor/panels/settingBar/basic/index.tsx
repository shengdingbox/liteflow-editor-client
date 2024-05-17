import React, { useEffect, useState } from 'react';
import { Graph } from '@antv/x6';
import { useModel } from '../../../hooks/useModel';
import styles from './index.module.less';

interface IProps {
  flowGraph: Graph;
}

const Basic: React.FC<IProps> = (props) => {
  const { flowGraph } = props;
  const [elString, setELString] = useState<string>('');

  useEffect(() => {
    const handleModelChange = () => {
      const model = useModel();
      setELString(model.toEL());
    };
    flowGraph.on('model:change', handleModelChange);
    return () => {
      flowGraph.off('model:change', handleModelChange);
    };
  }, [flowGraph, setELString]);

  return (
    <div className={styles.liteflowEditorBasicContainer}>
      <div className={styles.elContentWrapper}>{elString}</div>
    </div>
  );
};

export default Basic;