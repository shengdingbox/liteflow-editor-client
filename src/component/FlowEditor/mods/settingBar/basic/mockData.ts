export default {
  // 串行编排(THEN)
  THEN: {
    type: 'THEN',
    children: [
      { type: 'Common', id: 'a' },
      { type: 'Common', id: 'b' },
      { type: 'Common', id: 'c' },
      { type: 'Common', id: 'd' },
    ],
  },
  // 并行编排(WHEN)
  WHEN: {
    type: 'THEN',
    children: [
      { type: 'Common', id: 'a' },
      {
        type: 'WHEN',
        children: [
          { type: 'Common', id: 'b' },
          { type: 'Common', id: 'c' },
          { type: 'Common', id: 'd' },
        ],
      },
      { type: 'Common', id: 'e' },
    ],
  },
  // 选择编排(SWITCH)
  SWITCH: {
    type: 'SWITCH',
    condition: { type: 'Switch', id: 'x' },
    children: [
      { type: 'Common', id: 'a' },
      { type: 'Common', id: 'b' },
      { type: 'Common', id: 'c' },
      { type: 'Common', id: 'd' },
    ],
  },
  // 条件编排(IF)
  IF: {
    type: 'IF',
    condition: { type: 'Branch', id: 'x' },
    children: [{ type: 'Common', id: 'a' }],
  },
  // FOR循环
  FOR: {
    type: 'FOR',
    condition: { type: 'For', id: 'x' },
    children: [
      {
        type: 'THEN',
        children: [
          { type: 'Common', id: 'a' },
          { type: 'Common', id: 'b' },
        ],
      },
    ],
  },
  // WHILE循环
  WHILE: {
    type: 'WHILE',
    condition: { type: 'While', id: 'x' },
    children: [
      {
        type: 'THEN',
        children: [
          { type: 'Common', id: 'a' },
          { type: 'Common', id: 'b' },
        ],
      },
    ],
  },
  // ITERATOR循环
  ITERATOR: {
    type: 'ITERATOR',
    condition: { type: 'Iterator', id: 'x' },
    children: [
      {
        type: 'THEN',
        children: [
          { type: 'Common', id: 'a' },
          { type: 'Common', id: 'b' },
        ],
      },
    ],
  },
} as Record<string, any>;
