import { Cell, Node, Edge } from '@antv/x6';
export { default as toString } from './toString';

export default function render(data: Record<string, any>) {
  const cells: Cell[] = [];
  // 1. 首先：添加一个开始节点
  const start: Node = Node.create({
    shape: 'Start',
    view: 'react-shape-view',
    attrs: {
      label: { text: '开始' },
    },
    data,
  });
  start.setData({ model: data }, { overwrite: true });

  cells.push(start);

  // 2. 其次：解析已有的节点
  const next: Cell = parse({ data, cells, previous: start });

  // 3. 最后：添加一个结束节点
  const last: Node = Node.create({
    shape: 'End',
    view: 'react-shape-view',
    attrs: {
      label: { text: '结束' },
    },
    data,
  });
  last.setData({ model: data }, { overwrite: true });
  cells.push(last);

  cells.push(
    Edge.create({
      shape: 'edge',
      source: next.id,
      target: last.id,
      attrs: { line: { stroke: '#c1c1c1' } },
    }),
  );

  return cells;
}

interface ParseParameters {
  data: Record<string, any>;
  cells: Cell[];
  previous: Node;
  options?: Record<string, any>;
}

export function parse({
  data,
  cells,
  previous,
  options,
}: ParseParameters): Node {
  if (!data.type) return previous;

  switch (data.type) {
    // 1、编排类：顺序、分支、循环
    case 'THEN':
      return parseThen({ data, cells, previous, options });
    case 'WHEN':
      return parseWhen({ data, cells, previous, options });
    case 'SWITCH':
      return parseSwitch({ data, cells, previous, options });
    case 'IF':
      return parseIf({ data, cells, previous, options });
    case 'FOR':
    case 'WHILE':
    case 'ITERATOR':
      return parseLoop({ data, cells, previous, options });

    // 2、组件类：顺序、分支、循环
    case 'CommonComponent':
    default:
      return parseCommon({ data, cells, previous, options });
  }
}

function parseThen({ data, cells, previous, options }: ParseParameters) {
  const { children } = data;
  let last: Node = previous;
  children.forEach((child: Record<string, any>, index: number) => {
    last = parse({
      data: child,
      cells,
      previous: last,
      options,
    });
  });
  return last;
}

function parseWhen({ data, cells, previous, options }: ParseParameters) {
  const { children } = data;
  const start = Node.create({
    shape: 'ParallelStart',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
  });
  start.setData({ model: data }, { overwrite: true });
  cells.push(start);
  cells.push(
    Edge.create({
      shape: 'edge',
      source: previous.id,
      target: start.id,
      attrs: { line: { stroke: '#c1c1c1' } },
    }),
  );
  const end = Node.create({
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
  });
  end.setData({ model: data }, { overwrite: true });
  children.forEach((child: Record<string, any>) => {
    const next = parse({
      data: child,
      cells,
      previous: start,
      options,
    });
    cells.push(
      Edge.create({
        shape: 'edge',
        source: next.id,
        target: end.id,
        attrs: { line: { stroke: '#c1c1c1' } },
      }),
    );
  });
  cells.push(end);
  return end;
}

function parseSwitch({ data, cells, previous, options }: ParseParameters) {
  const { condition, children } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
    data,
  });
  start.setData({ model: data }, { overwrite: true });
  cells.push(start);
  cells.push(
    Edge.create({
      shape: 'edge',
      source: previous.id,
      target: start.id,
      attrs: { line: { stroke: '#c1c1c1' } },
    }),
  );
  const end = Node.create({
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
  });
  end.setData({ model: data }, { overwrite: true });
  children.forEach((child: Record<string, any>) => {
    const next = parse({ data: child, cells, previous: start, options });
    cells.push(
      Edge.create({
        shape: 'edge',
        source: next.id,
        target: end.id,
        attrs: { line: { stroke: '#c1c1c1' } },
      }),
    );
  });
  cells.push(end);
  return end;
}

function parseIf({ data, cells, previous, options }: ParseParameters) {
  const { condition, children = [] } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
    data,
  });
  start.setData({ model: data }, { overwrite: true });
  cells.push(start);
  cells.push(
    Edge.create({
      shape: 'edge',
      source: previous.id,
      target: start.id,
      attrs: { line: { stroke: '#c1c1c1' } },
    }),
  );
  const end = Node.create({
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
  });
  end.setData({ model: data }, { overwrite: true });
  const [first, last] = children;
  const trueNode = parse({
    data: first,
    cells,
    previous: start,
    options: { edge: { label: 'true' } },
  });
  cells.push(
    Edge.create({
      shape: 'edge',
      source: trueNode.id,
      target: end.id,
      attrs: { line: { stroke: '#c1c1c1' } },
    }),
  );
  let falseNode;
  if (!last) {
    falseNode = parse({
      data: { type: 'Virtual', id: 'v' },
      cells,
      previous: start,
      options: {
        edge: { label: 'false' },
        node: { attrs: { label: { text: '' } } },
      },
    });
  } else {
    falseNode = parse({
      data: last,
      cells,
      previous: start,
      options: { edge: { label: 'false' } },
    });
  }

  cells.push(
    Edge.create({
      shape: 'edge',
      source: falseNode.id,
      target: end.id,
      attrs: { line: { stroke: '#c1c1c1' } },
    }),
  );
  cells.push(end);
  return end;
}

function parseLoop({ data, cells, previous, options }: ParseParameters) {
  const { condition, children } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
    data,
  });
  start.setData({ model: data }, { overwrite: true });
  cells.push(start);
  cells.push(
    Edge.create({
      shape: 'edge',
      source: previous.id,
      target: start.id,
      attrs: { line: { stroke: '#c1c1c1' } },
    }),
  );
  const end = Node.create({
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
  });
  end.setData({ model: data }, { overwrite: true });
  if (children.length === 1 && children[0].type === 'THEN') {
    children[0].children.forEach((child: Record<string, any>) => {
      const next = parse({ data: child, cells, previous: start, options });
      cells.push(
        Edge.create({
          shape: 'edge',
          source: next.id,
          target: end.id,
          attrs: { line: { stroke: '#c1c1c1' } },
        }),
      );
    });
  } else {
    children.forEach((child: Record<string, any>) => {
      const next = parse({ data: child, cells, previous: start, options });
      cells.push(
        Edge.create({
          shape: 'edge',
          source: next.id,
          target: end.id,
          attrs: { line: { stroke: '#c1c1c1' } },
        }),
      );
    });
  }
  cells.push(end);
  return end;
}

function parseCommon({ data, cells, previous, options = {} }: ParseParameters) {
  const { id, type } = data;
  const common = Node.create({
    shape: type,
    view: 'react-shape-view',
    attrs: {
      label: { text: id },
    },
    data,
    ...(options.node || {}),
  });
  common.setData({ model: data }, { overwrite: true });
  cells.push(common);

  if (previous) {
    cells.push(
      Edge.create({
        shape: 'edge',
        source: previous.id,
        target: common.id,
        attrs: { line: { stroke: '#c1c1c1' } },
        ...(options.edge || {}),
      }),
    );
  }
  return common;
}
