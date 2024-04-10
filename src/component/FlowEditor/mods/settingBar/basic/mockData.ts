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
} as Record<string, any>;
