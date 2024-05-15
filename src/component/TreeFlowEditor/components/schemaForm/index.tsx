import React, { useEffect } from 'react';
import { useForm } from 'form-render';
import FormRender from '@/components/FormRender';
import { Empty } from 'antd';

import styles from './index.module.less';

interface IConfigData {
  [key: string]: any;
}

interface IProps {
  schema: {
    type: string;
    properties: { [key: string]: any };
  };
  configData: IConfigData;
  changeConfigData(data: IConfigData): void;
  readOnly: boolean;
}

const SchemaForm: React.FC<IProps> = (props) => {
  const { schema, configData, changeConfigData, readOnly } = props;
  const form = useForm();

  useEffect(() => {
    form.setValues(configData);
  }, [configData]);

  // form
  form.onItemChange = (path: string, value: any) => {
    form.setValueByPath(path, value);
    changeConfigData({ ...form.getValues(), [path]: value });
  };

  return schema && Object.keys(schema).length > 0 ? (
    <div className={styles.container}>
      <FormRender
        form={form}
        schema={schema}
        disabled={readOnly}
        onFinish={(formData, valid) => {
          // console.log(formData, valid);
        }}
      />
    </div>
  ) : (
    <Empty description={'暂无投放配置'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
  );
};

export default SchemaForm;
