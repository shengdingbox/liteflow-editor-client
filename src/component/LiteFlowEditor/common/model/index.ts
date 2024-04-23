import { Cell, Node, Edge } from '@antv/x6';
import { NodeTypeEnum, ConditionTypeEnum } from '../../constant';
export { default as toString } from './toString';

interface ParseParameters {
  data: Record<string, any>;
  parent: Record<string, any> | undefined;
  cells: Cell[];
  previous: Node;
  options?: Record<string, any>;
}

export default function render(data: Record<string, any>) {
  const cells: Cell[] = [];
  // 1. 首先：添加一个开始节点
  const start: Node = Node.create({
    shape: 'Start',
    view: 'react-shape-view',
    attrs: {
      label: { text: '开始' },
    },
  });
  start.setData({ model: data, parent: undefined }, { overwrite: true });

  cells.push(start);

  // 2. 其次：解析已有的节点
  const next: Cell = parse({ data, parent: undefined, cells, previous: start });

  // 3. 最后：添加一个结束节点
  const last: Node = Node.create({
    shape: 'End',
    view: 'react-shape-view',
    attrs: {
      label: { text: '结束' },
    },
  });
  last.setData({ model: data, parent: undefined }, { overwrite: true });
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

export function parse({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters): Node {
  if (!data.type) return previous;

  switch (data.type) {
    // 1、编排类：顺序、分支、循环
    case ConditionTypeEnum.TYPE_THEN:
      return parseThen({ data, parent, cells, previous, options });
    case ConditionTypeEnum.TYPE_WHEN:
      return parseWhen({ data, parent, cells, previous, options });
    case ConditionTypeEnum.TYPE_SWITCH:
      return parseSwitch({ data, parent, cells, previous, options });
    case ConditionTypeEnum.TYPE_IF:
      return parseIf({ data, parent, cells, previous, options });
    case ConditionTypeEnum.TYPE_FOR:
    case ConditionTypeEnum.TYPE_WHILE:
    case ConditionTypeEnum.TYPE_ITERATOR:
      return parseLoop({ data, parent, cells, previous, options });

    // 2、组件类：顺序、分支、循环
    case NodeTypeEnum.COMMON:
    default:
      return parseCommon({ data, parent, cells, previous, options });
  }
}

function parseThen({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters) {
  const { children } = data;
  let last: Node = previous;
  children.forEach((child: Record<string, any>) => {
    last = parse({
      data: child,
      parent: data,
      cells,
      previous: last,
      options,
    });
  });
  return last;
}

function parseWhen({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters) {
  const { children } = data;
  const start = Node.create({
    shape: 'When',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  start.setData({ model: data, parent }, { overwrite: true });
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
    shape: 'IntermediateEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  end.setData({ model: data, parent }, { overwrite: true });
  children.forEach((child: Record<string, any>) => {
    const next = parse({
      data: child,
      parent: data,
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

function parseSwitch({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters) {
  const { condition, children } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  });
  start.setData({ model: data, parent }, { overwrite: true });
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
    shape: 'IntermediateEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  end.setData({ model: data, parent }, { overwrite: true });
  children.forEach((child: Record<string, any>) => {
    const next = parse({
      data: child,
      parent: data,
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

function parseIf({ data, parent, cells, previous, options }: ParseParameters) {
  const { condition, children = [] } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  });
  start.setData({ model: data, parent }, { overwrite: true });
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
    shape: 'IntermediateEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  end.setData({ model: data, parent }, { overwrite: true });
  const [first, last] = children;
  const trueNode = parse({
    data: first,
    parent: data,
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
      parent: data,
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
      parent: data,
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

function parseLoop({
  data,
  parent,
  cells,
  previous,
  options,
}: ParseParameters) {
  const { condition, children } = data;
  const start = Node.create({
    shape: condition.type,
    view: 'react-shape-view',
    attrs: {
      label: { text: condition.id },
    },
  });
  start.setData({ model: data, parent }, { overwrite: true });
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
    shape: 'IntermediateEnd',
    view: 'react-shape-view',
    attrs: {
      label: { text: '' },
    },
  });
  end.setData({ model: data, parent }, { overwrite: true });
  if (
    children.length === 1 &&
    children[0].type === ConditionTypeEnum.TYPE_THEN
  ) {
    children[0].children.forEach((child: Record<string, any>) => {
      const next = parse({
        data: child,
        parent: data,
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
  } else {
    children.forEach((child: Record<string, any>) => {
      const next = parse({
        data: child,
        parent: data,
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
  }
  cells.push(end);
  return end;
}

function parseCommon({
  data,
  parent,
  cells,
  previous,
  options = {},
}: ParseParameters) {
  const { id, type } = data;
  const common = Node.create({
    shape: type,
    view: 'react-shape-view',
    attrs: {
      label: { text: id },
    },
    ...(options.node || {}),
  });
  common.setData({ model: data, parent }, { overwrite: true });
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
