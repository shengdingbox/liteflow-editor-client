export default function render(data: Record<string, any>) {
  const cells: Record<string, any>[] = [];
  const start: Record<string, any> = {
    id: 'start',
    shape: 'Start',
    view: 'react-shape-view',
    attrs: {
      label: { text: '开始' },
    },
  };
  cells.push(start);

  const next: Record<string, any> = parse({ data, cells, previous: start });

  const last = {
    id: 'end',
    shape: 'End',
    view: 'react-shape-view',
    attrs: {
      label: { text: '结束' },
    },
  };
  cells.push(last);

  cells.push({
    shape: 'edge',
    source: next.id,
    target: last.id,
  });

  return { cells };
}

interface ParseParameters {
  data: Record<string, any>;
  cells: Record<string, any>[];
  previous: Record<string, any>;
  options?: Record<string, any>;
}

function parse({
  data,
  cells,
  previous,
  options,
}: ParseParameters): Record<string, any> {
  switch (data.type) {
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
    case 'Common':
    default:
      return parseCommon({ data, cells, previous, options });
  }
}

function parseThen({ data, cells, previous, options }: ParseParameters) {
  const { children } = data;
  let last: Record<string, any> = {};
  children.forEach((child: Record<string, any>, index: number) => {
    last = parse({
      data: child,
      cells,
      previous: index === 0 ? previous : last,
      options,
    });
  });
  return last;
}

function parseWhen({ data, cells, previous, options }: ParseParameters) {
  const { children } = data;
  const parallelStart = {
    id: 'parallelStart',
    shape: 'ParallelStart',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  };
  cells.push(parallelStart);
  cells.push({
    shape: 'edge',
    source: previous.id,
    target: parallelStart.id,
  });
  const parallelEnd = {
    id: 'parallelEnd',
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  };
  children.forEach((child: Record<string, any>) => {
    const next = parse({
      data: child,
      cells,
      previous: parallelStart,
      options,
    });
    cells.push({
      shape: 'edge',
      source: next.id,
      target: parallelEnd.id,
    });
  });
  cells.push(parallelEnd);
  return parallelEnd;
}

function parseSwitch({ data, cells, previous, options }: ParseParameters) {
  const { condition, children } = data;
  const start = {
    id: condition.id,
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  };
  cells.push(start);
  cells.push({
    shape: 'edge',
    source: previous.id,
    target: start.id,
  });
  const end = {
    id: 'switchEnd',
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  };
  children.forEach((child: Record<string, any>) => {
    const next = parse({ data: child, cells, previous: start, options });
    cells.push({
      shape: 'edge',
      source: next.id,
      target: end.id,
    });
  });
  cells.push(end);
  return end;
}

function parseIf({ data, cells, previous, options }: ParseParameters) {
  const { condition, children = [] } = data;
  const start = {
    id: condition.id,
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  };
  cells.push(start);
  cells.push({
    shape: 'edge',
    source: previous.id,
    target: start.id,
  });
  const end = {
    id: 'switchEnd',
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  };
  const [first, last] = children;
  const trueNode = parse({
    data: first,
    cells,
    previous: start,
    options: { edge: { label: 'true' } },
  });
  cells.push({
    shape: 'edge',
    source: trueNode.id,
    target: end.id,
  });
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

  cells.push({
    shape: 'edge',
    source: falseNode.id,
    target: end.id,
  });
  cells.push(end);
  return end;
}

function parseLoop({ data, cells, previous, options }: ParseParameters) {
  const { condition, children } = data;
  const start = {
    id: condition.id,
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  };
  cells.push(start);
  cells.push({
    shape: 'edge',
    source: previous.id,
    target: start.id,
  });
  const end = {
    id: 'loopEnd',
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  };
  children.forEach((child: Record<string, any>) => {
    const next = parse({ data: child, cells, previous: start, options });
    cells.push({
      shape: 'edge',
      source: next.id,
      target: end.id,
    });
  });
  cells.push(end);
  return end;
}

function parseCommon({ data, cells, previous, options = {} }: ParseParameters) {
  const { id, type } = data;
  const common = {
    id,
    shape: type,
    view: 'react-shape-view',
    attrs: {
      label: { text: id },
    },
    ...(options.node || {}),
  };
  cells.push(common);

  if (previous) {
    cells.push({
      shape: 'edge',
      source: previous.id,
      target: common.id,
      ...(options.edge || {}),
    });
  }
  return common;
}
