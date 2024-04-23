import { ConditionTypeEnum } from '../../../constant';
import icon from './icon.svg';

const config = {
  label: '并行(When)',
  type: ConditionTypeEnum.TYPE_WHEN,
  icon,
  node: {
    primer: 'circle',
  },
};

export default config;
