import { StringExt } from '@antv/x6';
export { default as toString } from './toString';

export default function render(data: Record<string, any>) {
  const cells: Record<string, any>[] = [];
  // 1. 首先：添加一个开始节点
  const start: Record<string, any> = {
    id: StringExt.uuid(),
    shape: 'Start',
    view: 'react-shape-view',
    attrs: {
      label: { text: '开始' },
    },
    data,
  };

  cells.push(start);

  // 2. 其次：解析已有的节点
  const next: Record<string, any> = parse({ data, cells, previous: start });

  // 3. 最后：添加一个结束节点
  const last = {
    id: StringExt.uuid(),
    shape: 'End',
    view: 'react-shape-view',
    attrs: {
      label: { text: '结束' },
    },
    data,
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
    id: StringExt.uuid(),
    shape: 'ParallelStart',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
  };
  cells.push(parallelStart);
  cells.push({
    shape: 'edge',
    source: previous.id,
    target: parallelStart.id,
    attrs: { line: { stroke: '#c1c1c1' } },
  });
  const parallelEnd = {
    id: StringExt.uuid(),
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
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
      attrs: { line: { stroke: '#c1c1c1' } },
    });
  });
  cells.push(parallelEnd);
  return parallelEnd;
}

function parseSwitch({ data, cells, previous, options }: ParseParameters) {
  const { condition, children } = data;
  const start = {
    id: StringExt.uuid(),
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
    data,
  };
  cells.push(start);
  cells.push({
    shape: 'edge',
    source: previous.id,
    target: start.id,
    attrs: { line: { stroke: '#c1c1c1' } },
  });
  const end = {
    id: StringExt.uuid(),
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
  };
  children.forEach((child: Record<string, any>) => {
    const next = parse({ data: child, cells, previous: start, options });
    cells.push({
      shape: 'edge',
      source: next.id,
      target: end.id,
      attrs: { line: { stroke: '#c1c1c1' } },
    });
  });
  cells.push(end);
  return end;
}

function parseIf({ data, cells, previous, options }: ParseParameters) {
  const { condition, children = [] } = data;
  const start = {
    id: StringExt.uuid(),
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
    data,
  };
  cells.push(start);
  cells.push({
    shape: 'edge',
    source: previous.id,
    target: start.id,
    attrs: { line: { stroke: '#c1c1c1' } },
  });
  const end = {
    id: StringExt.uuid(),
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
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
    attrs: { line: { stroke: '#c1c1c1' } },
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
    attrs: { line: { stroke: '#c1c1c1' } },
  });
  cells.push(end);
  return end;
}

function parseLoop({ data, cells, previous, options }: ParseParameters) {
  const { condition, children } = data;
  const start = {
    id: StringExt.uuid(),
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
    data,
  };
  cells.push(start);
  cells.push({
    shape: 'edge',
    source: previous.id,
    target: start.id,
    attrs: { line: { stroke: '#c1c1c1' } },
  });
  const end = {
    id: StringExt.uuid(),
    shape: 'ParallelEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
    data,
  };
  if (children.length === 1 && children[0].type === 'THEN') {
    children[0].children.forEach((child: Record<string, any>) => {
      const next = parse({ data: child, cells, previous: start, options });
      cells.push({
        shape: 'edge',
        source: next.id,
        target: end.id,
        attrs: { line: { stroke: '#c1c1c1' } },
      });
    });
  } else {
    children.forEach((child: Record<string, any>) => {
      const next = parse({ data: child, cells, previous: start, options });
      cells.push({
        shape: 'edge',
        source: next.id,
        target: end.id,
        attrs: { line: { stroke: '#c1c1c1' } },
      });
    });
  }
  cells.push(end);
  return end;
}

function parseCommon({ data, cells, previous, options = {} }: ParseParameters) {
  const { id, type } = data;
  const common = {
    id: StringExt.uuid(),
    shape: type,
    view: 'react-shape-view',
    attrs: {
      label: { text: id },
    },
    data,
    ...(options.node || {}),
  };
  cells.push(common);

  if (previous) {
    cells.push({
      shape: 'edge',
      source: previous.id,
      target: common.id,
      attrs: { line: { stroke: '#c1c1c1' } },
      ...(options.edge || {}),
    });
  }
  return common;
}
