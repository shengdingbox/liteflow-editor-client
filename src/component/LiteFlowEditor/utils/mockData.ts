export default {
  // 串行编排(THEN)
  THEN: {
    type: 'THEN',
    children: [
      { type: 'CommonComponent', id: 'a' },
      { type: 'CommonComponent', id: 'b' },
      { type: 'CommonComponent', id: 'c' },
      { type: 'CommonComponent', id: 'd' },
    ],
  },
  // 并行编排(WHEN)
  WHEN: {
    type: 'THEN',
    children: [
      { type: 'CommonComponent', id: 'a' },
      {
        type: 'WHEN',
        children: [
          { type: 'CommonComponent', id: 'b' },
          { type: 'CommonComponent', id: 'c' },
          { type: 'CommonComponent', id: 'd' },
        ],
      },
      { type: 'CommonComponent', id: 'e' },
    ],
  },
  // 选择编排(SWITCH)
  SWITCH: {
    type: 'SWITCH',
    condition: { type: 'SwitchComponent', id: 'x' },
    children: [
      { type: 'CommonComponent', id: 'a' },
      { type: 'CommonComponent', id: 'b' },
      { type: 'CommonComponent', id: 'c' },
      { type: 'CommonComponent', id: 'd' },
    ],
  },
  // 条件编排(IF)
  IF: {
    type: 'IF',
    condition: { type: 'IfComponent', id: 'x' },
    children: [{ type: 'CommonComponent', id: 'a' }],
  },
  // FOR循环
  FOR: {
    type: 'FOR',
    condition: { type: 'ForComponent', id: 'x' },
    children: [
      {
        type: 'THEN',
        children: [
          { type: 'CommonComponent', id: 'a' },
          { type: 'CommonComponent', id: 'b' },
        ],
      },
    ],
  },
  // WHILE循环
  WHILE: {
    type: 'WHILE',
    condition: { type: 'WhileComponent', id: 'x' },
    children: [
      {
        type: 'THEN',
        children: [
          { type: 'CommonComponent', id: 'a' },
          { type: 'CommonComponent', id: 'b' },
        ],
      },
    ],
  },
  // ITERATOR循环
  ITERATOR: {
    type: 'ITERATOR',
    condition: { type: 'IteratorComponent', id: 'x' },
    children: [
      {
        type: 'THEN',
        children: [
          { type: 'CommonComponent', id: 'a' },
          { type: 'CommonComponent', id: 'b' },
        ],
      },
    ],
  },
} as Record<string, any>;
