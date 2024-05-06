import { LiteNodeData, NodeCompStore, NodeData } from '../constant/Comp';

function getThenChildrenCells(children: LiteNodeData[]) {
  const cells = [];
  let curNode, preNode;
  for (let i = 0; i < children?.length; i++) {
    preNode = curNode;
    curNode = createNode(children[i]);
    cells.push(curNode);
    if (preNode && curNode) {
      cells.push(createEdge(preNode.id, curNode.id));
    }
  }
  console.log(cells);
  return cells;
}

function nodeToCells(
  node: LiteNodeData,
  cells: Array<Record<string, any>>,
  preNodeId?: string,
): string {
  const comp = NodeCompStore[node.type];
  const curNode = createNode(node);
  cells.push(curNode);
  if (preNodeId) {
    const edge = createEdge(preNodeId, curNode.id);
    cells.push(edge);
  }
  preNodeId = curNode.id;
  if (comp.childrenType === 'then' || comp.childrenType === 'include') {
    node.children?.forEach((n) => {
      preNodeId = nodeToCells(n, cells, preNodeId);
    });
  } else if (comp.childrenType === 'multiple') {
    if (comp.multipleType === 'when') {
    } else if (comp.multipleType === 'if') {
    } else if (comp.multipleType === 'switch') {
    }
  }
  return curNode.id;
}

export function toGraphJson(node: LiteNodeData): any {
  console.log('===node', node);
  const comp = NodeCompStore[node.type];
  console.log('===comp.childrenType', comp.childrenType);
  // children
  if (comp.childrenType === 'then') {
    if (node.children) {
      return getThenChildrenCells(node.children);
    }
  } else if (comp.childrenType === 'include') {
    if (node.children) {
      return getThenChildrenCells(node.children);
    }
  } else if (comp.childrenType === 'multiple') {
    console.log('====multiple');
    const cells: any[] = [];
    if (node.multiple) {
      node.multiple.forEach((line) => {
        if (line.children) {
          cells.push(...getChildrenCells(line.children));
        }
      });
    }
    return cells;
  }
  return [];
}

function createNode(node: LiteNodeData) {
  if (node.type === 'common') {
    return {
      view: 'react-shape-view',
      attrs: { label: { text: node.props?.node } },
      shape: 'NodeComponent',
      id: generateNewId(),
      data: null,
      zIndex: 1,
    };
  } else if (node.type === 'when') {
    return {
      view: 'react-shape-view',
      attrs: {
        body: { refCx: '50%', refCy: '50%', refR: '50%' },
        label: { text: '' },
      },
      shape: 'WHEN',
      primer: 'circle',
      id: generateNewId(),
      data: null,
      zIndex: 1,
    };
  } else {
    return {
      view: 'react-shape-view',
      attrs: {
        body: { refCx: '50%', refCy: '50%', refR: '50%' },
        label: { text: '' },
      },
      shape: 'WHEN',
      primer: 'circle',
      id: generateNewId(),
      data: null,
      zIndex: 1,
    };
  }
}

function createEdge(from: string, to: string, label?: string) {
  return {
    shape: 'LITEFLOW_EDGE',
    labels: [{ attrs: { label: { text: label } } }],
    id: generateNewId(),
    source: { cell: from },
    target: { cell: to },
    zIndex: 0,
  };
}

export function generateNewId(): string {
  return Math.random().toString(36).substring(2);
}
// {
//     shape: 'LITEFLOW_EDGE',
//     labels: [{ attrs: { label: { text: '+' } } }],
//     id: 'b2043003-d626-4b09-968a-ed6fe06e8104',
//     source: { cell: '68cc1497-3446-4d09-b7ba-d26b02195d7b' },
//     target: { cell: 'd70a5b8b-5294-4a2a-8ebb-525f7c4959b1' },
//     zIndex: 0,
//   },
//   {
//     shape: 'LITEFLOW_EDGE',

//     labels: [{ attrs: { label: { text: '+' } } }],
//     id: '45328a21-c300-495a-9fda-cf8a2a02ccbb',
//     source: { cell: 'd70a5b8b-5294-4a2a-8ebb-525f7c4959b1' },
//     target: { cell: '6cbc6bcf-cb77-44a9-8217-2151839056d2' },
//     zIndex: 0,
//   },
//   {
//     shape: 'LITEFLOW_EDGE',

//     labels: [{ attrs: { label: { text: '+' } } }],
//     id: '63d32698-ab15-46b3-b7f0-3f3281b29d6a',
//     source: { cell: '6cbc6bcf-cb77-44a9-8217-2151839056d2' },
//     target: { cell: '00728c26-0e53-451f-9364-eecff429c3ae' },
//     zIndex: 0,
//   },
//   {
//     shape: 'LITEFLOW_EDGE',
//     labels: [{ attrs: { label: { text: '+' } } }],
//     id: 'caaa1584-2445-4044-ba66-f4f28a0a3f31',
//     source: { cell: '00728c26-0e53-451f-9364-eecff429c3ae' },
//     target: { cell: 'd88826c7-b269-4e1b-b46f-ee9b2dcc0dae' },
//     zIndex: 0,
//   },
//   {
//     shape: 'LITEFLOW_EDGE',
//     labels: [{ attrs: { label: { text: '+' } } }],
//     id: '3034a978-1e76-4744-b943-bc4c7cc75f5b',
//     source: { cell: 'd88826c7-b269-4e1b-b46f-ee9b2dcc0dae' },
//     target: { cell: '0e25bdfd-4038-437c-8a92-041ffa9da610' },
//     zIndex: 0,
//   },
//   {
//     view: 'react-shape-view',
//     attrs: { body: { refCx: '50%', refCy: '50%', refR: '50%' } },
//     shape: 'LITEFLOW_START',
//     primer: 'circle',
//     id: '68cc1497-3446-4d09-b7ba-d26b02195d7b',
//     data: null,
//     zIndex: 1,
//   },
//   {
//     view: 'react-shape-view',
//     attrs: { label: { text: 'a' } },
//     shape: 'NodeComponent',
//     id: 'd70a5b8b-5294-4a2a-8ebb-525f7c4959b1',
//     data: null,
//     zIndex: 1,
//   },
//   {
//     view: 'react-shape-view',
//     attrs: { label: { text: 'b' } },
//     shape: 'NodeComponent',
//     id: '6cbc6bcf-cb77-44a9-8217-2151839056d2',
//     data: null,
//     zIndex: 1,
//   },
//   {
//     view: 'react-shape-view',
//     attrs: { label: { text: 'c' } },
//     shape: 'NodeComponent',
//     id: '00728c26-0e53-451f-9364-eecff429c3ae',
//     data: null,
//     zIndex: 1,
//   },
//   {
//     view: 'react-shape-view',
//     attrs: { label: { text: 'd' } },
//     shape: 'NodeComponent',
//     id: 'd88826c7-b269-4e1b-b46f-ee9b2dcc0dae',
//     data: null,
//     zIndex: 1,
//   },
//   {
//     view: 'react-shape-view',
//     attrs: { body: { refCx: '50%', refCy: '50%', refR: '50%' } },
//     shape: 'LITEFLOW_END',
//     primer: 'circle',
//     id: '0e25bdfd-4038-437c-8a92-041ffa9da610',
//     data: null,
//     zIndex: 1,
//   },
