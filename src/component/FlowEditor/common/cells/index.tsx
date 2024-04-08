import { Graph } from '@antv/x6';
import classNames from 'classnames';
import styles from './index.module.less';
// 开始 & 结束
import { default as Start } from './start';
import { default as End } from './end';
// 顺序：串行、并行
import { default as Common } from './common';
import { default as ParallelStart } from './parallel-start';
import { default as ParallelEnd } from './parallel-end';
// 分支：选择、条件
import { default as Switch } from './switch';
import { default as Branch } from './branch';
// 循环：TODO


export const View: React.FC<any> = (props) => {
  const { node, icon, ...rest } = props;
  return (
    <div className={classNames(styles.shapeWrapper, styles.eventShape)} {...rest}>
      <img className={styles.shapeSvg} src={icon}></img>
    </div>
  );
};


[
  Common,
  ParallelStart,
  ParallelEnd,
  Branch,
  End,
  Start,
  Switch
].forEach((cell) => {
  // 注册AntV X6节点
  const { type, label, icon } = cell;
  Graph.registerNode(type, {
    shape: type,
    component(props: any) {
      return <View {...props} icon={icon} />
    },
    width: 30,
    height: 30,
    attrs: {
      label: {
        refX: 0.5,
        refY: '100%',
        refY2: 20,
        text: label,
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
      label: label,
    },
  });
});

export const NODE_GROUP = {
  key: 'node',
  name: '顺序类',
  cellTypes: [Common, ParallelStart],
};

// Switch.disabled = true;
export const BRANCH_GROUP = {
  key: 'branch',
  name: '分支类',
  cellTypes: [Switch, Branch],
};

export const CONTROL_GROUP = {
  key: 'control',
  name: '循环类',
  cellTypes: [],
};