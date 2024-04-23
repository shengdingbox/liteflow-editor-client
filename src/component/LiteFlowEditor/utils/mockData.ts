import { ConditionTypeEnum, NodeTypeEnum } from '../constant';
export default {
  // 串行编排(THEN)
  THEN: {
    type: ConditionTypeEnum.TYPE_THEN,
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },
      { type: NodeTypeEnum.COMMON, id: 'c' },
      { type: NodeTypeEnum.COMMON, id: 'd' },
    ],
  },
  // 并行编排(WHEN)
  WHEN: {
    type: ConditionTypeEnum.TYPE_THEN,
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      {
        type: ConditionTypeEnum.TYPE_WHEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'b' },
          { type: NodeTypeEnum.COMMON, id: 'c' },
          { type: NodeTypeEnum.COMMON, id: 'd' },
        ],
      },
      { type: NodeTypeEnum.COMMON, id: 'e' },
    ],
  },
  // 选择编排(SWITCH)
  SWITCH: {
    type: ConditionTypeEnum.TYPE_SWITCH,
    condition: { type: NodeTypeEnum.SWITCH, id: 'x' },
    children: [
      { type: NodeTypeEnum.COMMON, id: 'a' },
      { type: NodeTypeEnum.COMMON, id: 'b' },
      { type: NodeTypeEnum.COMMON, id: 'c' },
      { type: NodeTypeEnum.COMMON, id: 'd' },
    ],
  },
  // 条件编排(IF)
  IF: {
    type: ConditionTypeEnum.TYPE_IF,
    condition: { type: NodeTypeEnum.IF, id: 'x' },
    children: [{ type: NodeTypeEnum.COMMON, id: 'a' }],
  },
  // FOR循环
  FOR: {
    type: ConditionTypeEnum.TYPE_FOR,
    condition: { type: NodeTypeEnum.FOR, id: 'x' },
    children: [
      {
        type: ConditionTypeEnum.TYPE_THEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'a' },
          { type: NodeTypeEnum.COMMON, id: 'b' },
        ],
      },
    ],
  },
  // WHILE循环
  WHILE: {
    type: ConditionTypeEnum.TYPE_WHILE,
    condition: { type: NodeTypeEnum.WHILE, id: 'x' },
    children: [
      {
        type: ConditionTypeEnum.TYPE_THEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'a' },
          { type: NodeTypeEnum.COMMON, id: 'b' },
        ],
      },
    ],
  },
  // ITERATOR循环
  ITERATOR: {
    type: ConditionTypeEnum.TYPE_ITERATOR,
    condition: { type: NodeTypeEnum.ITERATOR, id: 'x' },
    children: [
      {
        type: ConditionTypeEnum.TYPE_THEN,
        children: [
          { type: NodeTypeEnum.COMMON, id: 'a' },
          { type: NodeTypeEnum.COMMON, id: 'b' },
        ],
      },
    ],
  },
} as Record<string, any>;
