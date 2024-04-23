import { ConditionTypeEnum, NodeTypeEnum } from '../constant';

export default function toString(data: Record<string, any>) {
  let result: string = '';
  result += parse(data);
  return result;
}

function parse(data: Record<string, any>): string {
  switch (data.type) {
    // 1、编排类：顺序、分支、循环
    case ConditionTypeEnum.TYPE_THEN:
      return parseThen(data);
    case ConditionTypeEnum.TYPE_WHEN:
      return parseWhen(data);
    case ConditionTypeEnum.TYPE_SWITCH:
      return parseSwitch(data);
    case ConditionTypeEnum.TYPE_IF:
      return parseIf(data);
    case ConditionTypeEnum.TYPE_FOR:
    case ConditionTypeEnum.TYPE_WHILE:
    case ConditionTypeEnum.TYPE_ITERATOR:
      return parseLoop(data);

    // 2、组件类：顺序、分支、循环
    case NodeTypeEnum.COMMON:
    default:
      return parseCommon(data);
  }
}

function parseThen(data: Record<string, any>) {
  const { children = [] } = data;
  return `THEN(${children
    .map((child: Record<string, any>) => parse(child))
    .join(', ')})`;
}

function parseWhen(data: Record<string, any>) {
  const { children = [] } = data;
  return `WHEN(${children
    .map((child: Record<string, any>) => parse(child))
    .join(', ')})`;
}

function parseSwitch(data: Record<string, any>) {
  const { condition, children = [] } = data;
  return `SWITCH(${parse(condition)}).to(${children
    .map((child: Record<string, any>) => parse(child))
    .join(', ')})`;
}

function parseIf(data: Record<string, any>) {
  const { condition, children = [] } = data;
  return `IF(${parse(condition)}, ${children
    .map((child: Record<string, any>) => parse(child))
    .join(', ')})`;
}

function parseLoop(data: Record<string, any>) {
  const { condition, children = [] } = data;
  return `${data.type}(${parse(condition)}).DO(${children
    .map((child: Record<string, any>) => parse(child))
    .join(', ')})`;
}

function parseCommon(data: Record<string, any>): string {
  return data.id;
}
