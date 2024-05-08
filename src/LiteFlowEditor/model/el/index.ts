/**
 * EL表达式各个操作符模型，继承关系为：
                      ┌─────────────────┐
                  ┌──▶│  ThenOperator   │
                  │   └─────────────────┘
                  │   ┌─────────────────┐
                  ├──▶│  WhenOperator   │
                  │   └─────────────────┘
                  │   ┌─────────────────┐
                  ├──▶│  SwitchOperator │
                  │   └─────────────────┘
  ┌──────────┐    │   ┌─────────────────┐
  │  ELNode  │────┼──▶│  IfOperator     │
  └──────────┘    │   └─────────────────┘
                  │   ┌─────────────────┐
                  ├──▶│  ForOperator    │
                  │   └─────────────────┘
                  │   ┌─────────────────┐
                  ├──▶│  ForOperator    │
                  │   └─────────────────┘
                  │   ┌─────────────────┐
                  └──▶│  NodeOperator   │
                      └─────────────────┘
 */
// 1. 顺序类
export { default as ThenOperator } from './then-operator';
export { default as WhenOperator } from './when-operator';
// 2. 分支类
export { default as SwitchOperator } from './switch-operator';
export { default as IfOperator } from './if-operator';
// 3. 循环类
export { default as ForOperator } from './for-operator';
export { default as WhileOperator } from './while-operator';
// 4. 节点类
export { default as NodeOperator } from './node-operator';
