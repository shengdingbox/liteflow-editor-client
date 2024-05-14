import { safeGet } from '../utils';
import { message } from 'antd';
import { Cell, Edge, Graph, Node } from '@antv/x6';
import { toJS } from 'mobx';
import { MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '../constant';
import { getSelectedNodes } from '../utils/flowChartUtils';
import { Grapher } from '../context/GraphContext';

interface Shortcut {
  keys: string | string[];
  handler: (grapher: Grapher) => void;
}

const shortcuts: { [key: string]: Shortcut } = {
  save: {
    keys: 'meta + s',
    handler(grapher: Grapher) {
      console.log('save');
      grapher.onSave?.(toJS(grapher.store.document.data));
      // console.log(flowGraph.toJSON());
      return false;
    },
  },
  undo: {
    keys: 'meta + z',
    handler(grapher: Grapher) {
      grapher.store.undo();
      // grapher.flowGraph.undo();
      return false;
    },
  },
  redo: {
    keys: 'meta + shift + z',
    handler(grapher: Grapher) {
      grapher.store.redo();
      // grapher.flowGraph.redo();
      return false;
    },
  },
  zoomIn: {
    keys: 'meta + shift + +',
    handler(grapher: Grapher) {
      const nextZoom = (grapher.flowGraph.zoom() + ZOOM_STEP).toPrecision(2);
      grapher.flowGraph.zoomTo(Number(nextZoom), { maxScale: MAX_ZOOM });
      return false;
    },
  },
  zoomOut: {
    keys: 'meta + shift + -',
    handler(grapher: Grapher) {
      const nextZoom = (grapher.flowGraph.zoom() - ZOOM_STEP).toPrecision(2);
      grapher.flowGraph.zoomTo(Number(nextZoom), { minScale: MIN_ZOOM });
      return false;
    },
  },
  copy: {
    keys: 'meta + c',
    handler(grapher: Grapher) {
      const cells = grapher.flowGraph.getSelectedCells();
      if (cells.length > 0) {
        grapher.flowGraph.copy(cells);
        message.success('复制成功');
      }
      return false;
    },
  },
  paste: {
    keys: 'meta + v',
    handler(grapher: Grapher) {
      if (!grapher.flowGraph.isClipboardEmpty()) {
        const cells = grapher.flowGraph.paste({ offset: 32 });
        grapher.flowGraph.cleanSelection();
        grapher.flowGraph.select(cells);
      }
      return false;
    },
  },
  delete: {
    keys: ['backspace', 'del'],
    handler(grapher: Grapher) {
      const toDelCells = grapher.flowGraph.getSelectedCells();
      const onEdgeDel = (edge: Edge) => {
        const srcNode = edge.getSourceNode() as Node;
        const isSrcNodeInDelCells = !!toDelCells.find((c) => c === srcNode);
        if (
          srcNode &&
          srcNode.shape === 'flow-branch' &&
          !isSrcNodeInDelCells
        ) {
          const portId = edge.getSourcePortId();
          if (portId === 'right' || portId === 'bottom') {
            const edgeLabel = safeGet(
              edge.getLabelAt(0),
              'attrs.label.text',
              '',
            );
            srcNode.setPortProp(portId, 'attrs/text/text', edgeLabel);
          }
        }
      };
      toDelCells.forEach((cell: Cell) => {
        if (cell.isEdge()) {
          onEdgeDel(cell);
        } else {
          grapher.flowGraph.getConnectedEdges(cell).forEach(onEdgeDel);
        }
      });
      grapher.flowGraph.removeCells(grapher.flowGraph.getSelectedCells());
      grapher.flowGraph.trigger('toolBar:forceUpdate');
      return false;
    },
  },
  selectAll: {
    keys: 'meta + a',
    handler(grapher: Grapher) {
      grapher.flowGraph.select(grapher.flowGraph.getCells());
      return false;
    },
  },
  bold: {
    keys: 'meta + b',
    handler(grapher: Grapher) {
      const cells = grapher.flowGraph.getSelectedCells();
      if (cells.length > 0) {
        const isAlreadyBold =
          safeGet(cells, '0.attrs.label.fontWeight', 'normal') === 'bold';
        cells.forEach((cell) => {
          cell.setAttrs({
            label: { fontWeight: isAlreadyBold ? 'normal' : 'bold' },
          });
        });
        grapher.flowGraph.trigger('toolBar:forceUpdate');
      }
      return false;
    },
  },
  italic: {
    keys: 'meta + i',
    handler(grapher: Grapher) {
      const cells = grapher.flowGraph.getSelectedCells();
      if (cells.length > 0) {
        const isAlreadyItalic =
          safeGet(cells, '0.attrs.label.fontStyle', 'normal') === 'italic';
        cells.forEach((cell) => {
          cell.setAttrs({
            label: { fontStyle: isAlreadyItalic ? 'normal' : 'italic' },
          });
        });
        grapher.flowGraph.trigger('toolBar:forceUpdate');
      }
      return false;
    },
  },
};

export default shortcuts;
