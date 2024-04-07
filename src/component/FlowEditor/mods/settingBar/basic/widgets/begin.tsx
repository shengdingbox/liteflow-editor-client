import { InputNumber } from 'antd';
import css from './begin.less';

interface Props {
  value?: number[];
  schema: any;
  onChange(value: any): void;
}

export default function TextMode(props: Props) {
  const { value, onChange } = props;
  return (
    <div className={css.container} style={{ flex: 1 }}>
      <InputNumber
        className={css.item}
        value={value?.[0]}
        onChange={(first) => {
          onChange([first, value?.[1]]);
        }}
      />
      <InputNumber
        className={css.item}
        value={value?.[1]}
        onChange={(last) => {
          onChange([value?.[0], last]);
        }}
      />
    </div>
  );
}
