import { Cell, Node, Edge, Graph, Model, ArrayExt } from '@antv/x6';
import { ReactShape } from '@antv/x6-react-shape';
import { Dnd } from '@antv/x6/lib/addon';
import { IBasicData } from '../../cellBase';
import meta from './meta';
import groupJson from './group.json';

interface Size {
  width: number;
  height: number;
}
export const DefaultCollapsedSize: Size = { width: 300, height: 30 };
export const DefaultExpandSize: Size = { width: 600, height: 100 };

export default class GroupNode extends ReactShape {
  clone(
    options: Cell.CloneOptions = {},
  ): this extends Node ? Node : this extends Edge ? Edge : Cell {
    const cloneNode = super.clone(options);
    cloneNode.resize(DefaultCollapsedSize.width, DefaultCollapsedSize.height);
    return cloneNode;
  }
  validateNode(
    droppingNode: Node,
    { targetGraph: flowChart }: Dnd.ValidateNodeOptions,
  ): boolean {
    const model = flowChart.model;
    const cloned = model.cloneCells(Model.fromJSON(groupJson));
    // sort asc by cell type
    const cells = ArrayExt.sortBy(
      Object.keys(cloned).map((key) => cloned[key]),
      (cell: Cell) => (cell.isEdge() ? 2 : 1),
    );

    flowChart.addNode(droppingNode);

    const dropZIndex: number = droppingNode.getZIndex() || 1;
    cells.forEach((cell: Cell, index: number) => {
      cell.setZIndex(dropZIndex + index + 1);
      flowChart.addCell(cell);
    });

    const nodes: Node[] = cells.filter((cell: Cell) => cell.isNode());
    let startNode = nodes[0];
    for (const node of nodes) {
      const { x: startX, y: startY } = startNode.position();
      const { x: nodeX, y: nodeY } = node.position();
      if (startX > nodeX) {
        startNode = node;
      } else if (startX === nodeX && startY > nodeY) {
        startNode = node;
      }
    }
    const { x: startX, y: startY } = startNode.position();
    const { x, y } = droppingNode.position();
    nodes.forEach((cell: Node) => {
      const { x: originX, y: originY } = cell.position();
      cell.position(x + originX - startX + 50, y + originY - startY + 50);
      droppingNode.addChild(cell);
      cell.hide();
    });

    flowChart.cleanSelection();
    flowChart.select(droppingNode);
    return false;
  }

  toggleCollapse() {
    const originData: any = this.getData<IBasicData>();
    const { collapsed, expandSize } = originData;
    const target: boolean = !collapsed;
    const cells = this.getChildren() || [];

    if (target) {
      const latestExpandSize = this.getSize();
      this.setData({
        ...originData,
        expandSize: latestExpandSize,
        collapsed: target,
      });
      this.resize(DefaultCollapsedSize.width, DefaultCollapsedSize.height);
      cells.forEach((cell) => {
        cell.hide();
      });
    } else {
      this.setData({
        ...originData,
        collapsed: target,
      });
      if (expandSize) {
        this.resize(expandSize.width, expandSize.height);
      }
      cells.forEach((cell) => {
        cell.show();
      });
    }
  }
}

GroupNode.config({
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
      fill: 'none',
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
    collapsed: true,
    expandSize: {
      width: DefaultExpandSize.width,
      height: DefaultExpandSize.height,
    },
    weight: 5,
  },
});
