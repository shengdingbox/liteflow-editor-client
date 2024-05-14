import React, { ReactElement } from 'react';
import { Tooltip } from 'antd';
import { Graph } from '@antv/x6';
import styles from '../index.module.less';
import { Grapher } from '../../../../context/GraphContext';

interface IOptions {
  tooltip: string;
  getIcon: (flowGraph: Graph) => ReactElement;
  handler: (grapher: Grapher) => void;
  disabled?: (grapher: Grapher) => boolean;
  selected?: (grapher: Grapher) => boolean;
}

interface IBtnWidgetProps {
  grapher: Grapher;
}

const makeBtnWidget = (options: IOptions) => {
  const Widget: React.FC<IBtnWidgetProps> = (props) => {
    const grapher = props.grapher;

    // if (!grapher.isReady()) {
    //   return null;
    // }

    const { tooltip, getIcon, handler } = options;
    const iconWrapperCls = [styles.btnWidget];
    let { disabled = false, selected = false } = options;
    if (typeof disabled === 'function') {
      disabled = disabled(grapher);
      disabled && iconWrapperCls.push(styles.disabled);
    }
    if (typeof selected === 'function') {
      selected = selected(grapher);
      selected && iconWrapperCls.push(styles.selected);
    }
    const onClick = (): void => {
      if (disabled) return;
      handler(grapher);
      grapher.flowGraph.trigger('toolBar:forceUpdate');
    };
    return (
      <Tooltip title={tooltip}>
        <div className={iconWrapperCls.join(' ')} onClick={onClick}>
          {getIcon(grapher.flowGraph)}
        </div>
      </Tooltip>
    );
  };
  return Widget;
};

export default makeBtnWidget;
