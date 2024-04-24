/** 常量 */
export const NODE_WIDTH = 30; // 节点宽度
export const NODE_HEIGHT = 30; // 节点高度
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 1.5;
export const ZOOM_STEP = 0.1;

export const NODE_TYPE_START = 'LITEFLOW_START';
export const NODE_TYPE_END = 'LITEFLOW_END';
export const NODE_TYPE_INTERMEDIATE_END = 'LITEFLOW_INTERMEDIATE_END';
export const NODE_TYPE_VIRTUAL = 'LITEFLOW_VIRTUAL';

export const LITEFLOW_EDGE = 'LITEFLOW_EDGE';
export const LITEFLOW_ANCHOR = 'LITEFLOW_ANCHOR';
export const LITEFLOW_ROUTER = 'LITEFLOW_ROUTER';

export const LINE_COLOR = '#c1c1c1';

/** 逻辑组件类型 */
export enum NodeTypeEnum {
  COMMON = 'NodeComponent', // common, 普通

  BOOLEAN = 'NodeBooleanComponent', // boolean, 布尔

  SWITCH = 'NodeSwitchComponent', // switch, 选择

  IF = 'NodeIfComponent', // if, 条件

  FOR = 'NodeForComponent', // for, 循环次数

  WHILE = 'NodeWhileComponent', // while, 循环条件

  BREAK = 'NodeBreakComponent', // break, 循环跳出

  ITERATOR = 'NodeIteratorComponent', // iterator, 循环迭代

  SCRIPT = 'ScriptCommonComponent', // script, 脚本

  SWITCH_SCRIPT = 'ScriptSwitchComponent', // switch_script, 选择脚本

  IF_SCRIPT = 'ScriptIfComponent', // if_script, 条件脚本

  FOR_SCRIPT = 'ScriptForComponent', // for_script, 循环次数脚本

  WHILE_SCRIPT = 'ScriptWhileComponent', // while_script, 循环条件脚本

  BREAK_SCRIPT = 'ScriptBreakComponent', // break_script, 循环跳出脚本

  FALLBACK = 'fallback', // 降级
}

/** 逻辑编排类型 */
export enum ConditionTypeEnum {
  TYPE_THEN = 'THEN', // then

  TYPE_WHEN = 'WHEN', // when

  TYPE_SWITCH = 'SWITCH', // switch

  TYPE_IF = 'IF', // if

  TYPE_PRE = 'PRE', // pre

  TYPE_FINALLY = 'FINALLY', // finally

  TYPE_FOR = 'FOR', // for

  TYPE_WHILE = 'WHILE', // while

  TYPE_ITERATOR = 'ITERATOR', // iterator

  TYPE_BREAK = 'BREAK', // break

  TYPE_CATCH = 'CATCH', // catch

  TYPE_AND_OR_OPT = 'AND_OR_OPT', // and_or_opt

  TYPE_NOT_OPT = 'NOT_OPT', // not_opt

  TYPE_ABSTRACT = 'ABSTRACT', // abstract
}
