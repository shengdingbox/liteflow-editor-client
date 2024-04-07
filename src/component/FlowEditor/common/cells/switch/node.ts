import { ArrayExt, Cell, Node, Model } from '@antv/x6';
import { ReactShape } from '@antv/x6-react-shape';
import { Dnd } from '@antv/x6/lib/addon';
import meta from './meta';
import groupJson from './group.json';

export default class SwitchNode extends ReactShape {
  validateNode(
    droppingNode: Node,
    { targetGraph: flowChart }: Dnd.ValidateNodeOptions,
  ) {
    const model = flowChart.model;
    const cloned = model.cloneCells(Model.fromJSON(groupJson));
    // sort asc by cell type
    const cells = ArrayExt.sortBy(
      Object.keys(cloned).map((key) => cloned[key]),
      (cell: Cell) => (cell.isEdge() ? 2 : 1),
    );

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
      cell.position(x + originX - startX, y + originY - startY);
    });

    model.addCells(cells);
    return false;
  }
}

SwitchNode.config({
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
