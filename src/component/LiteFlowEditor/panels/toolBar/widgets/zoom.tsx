import React, { useState, useEffect } from 'react';
import { Graph } from '@antv/x6';
import { ZoomOutOutlined, ZoomInOutlined } from '@ant-design/icons';
import { MAX_ZOOM, MIN_ZOOM } from '../../../constant';
import shortcuts from '../../../common/shortcuts';
import makeBtnWidget from './common/makeBtnWidget';
import { useGraph } from '../../../hooks';
import styles from './index.module.less';

interface IProps {
  flowChart: Graph;
}

const ZoomOut: React.FC<IProps> = makeBtnWidget({
  tooltip: '缩小',
  handler: shortcuts.zoomOut.handler,
  getIcon() {
    return <ZoomOutOutlined />;
  },
  disabled(flowChart: Graph) {
    return flowChart.zoom() <= MIN_ZOOM;
  },
});

const ZoomIn: React.FC<IProps> = makeBtnWidget({
  tooltip: '放大',
  handler: shortcuts.zoomIn.handler,
  getIcon() {
    return <ZoomInOutlined />;
  },
  disabled(flowChart: Graph) {
    return flowChart.zoom() >= MAX_ZOOM;
  },
});

const Zoom: React.FC<IProps> = (props) => {
  const flowChart = useGraph();
  const [scale, setScale] = useState<number>(flowChart.zoom());
  useEffect(() => {
    const handleScale = () => {
      setScale(flowChart.zoom());
    };
    flowChart.on('scale', handleScale);
    return () => {
      flowChart.off('scale', handleScale);
    };
  }, [flowChart]);
  return (
    <div className={styles.zoomContainer}>
      <ZoomOut {...props} />
      <span className={styles.zoomText}>{Helper.scaleFormatter(scale)}</span>
      <ZoomIn {...props} />
    </div>
  );
};

const Helper = {
  scaleFormatter(scale: number): string {
    return (scale * 100).toFixed(0) + '%';
  },
};

export default Zoom;
