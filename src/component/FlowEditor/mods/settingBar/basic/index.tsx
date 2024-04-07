import React from 'react';
import FormRender, { useForm } from 'form-render';
import { Graph } from '@antv/x6';
import { forceLayout } from '../../../utils/flowChartUtils';
import schema from './schema';
import styles from './index.module.less';
import begin from './widgets/begin';

interface IProps {
  flowChart: Graph;
}

const Basic: React.FC<IProps> = (props) => {
  const { flowChart } = props;
  const form = useForm();

  const onValuesChange = () => {
    forceLayout(flowChart, form.getValues());
  };

  return (
    <div className={styles.container}>
      <FormRender
        form={form}
        schema={schema as any}
        widgets={{ begin }}
        onValuesChange={onValuesChange}
      />
    </div>
  );
};

export default Basic;
