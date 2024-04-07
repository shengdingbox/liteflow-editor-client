import { ReactShape } from '@antv/x6-react-shape';
import meta from './meta';

export default class EndEventNode extends ReactShape {}

EndEventNode.config({
  shape: meta.type,
  component: meta.type,
  width: 30,
  height: 30,
  attrs: {
    label: {
      refX: 0.5,
      refY: '100%',
      refY2: 20,
      text: meta.label,
      fill: '#333',
      fontSize: 13,
      textAnchor: 'middle',
      textVerticalAnchor: 'middle',
      textWrap: {
        width: 80,
        height: 32,
        ellipsis: true,
        breakWord: true,
      },
    },
  },
  data: {
    label: meta.label,
  },
});
