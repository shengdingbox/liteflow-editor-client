import { Context, createContext, RefObject } from 'react';
import { Graph } from '@antv/x6';

/**
 * graph: Graph实例
 * graphWrapper: Graph的容器
 */
interface IGraphContext {
  model: any;
  graph: Graph | undefined;
  graphWrapper: HTMLDivElement | RefObject<HTMLDivElement> | undefined;
}

const defaultValue: IGraphContext = {
  graph: undefined,
  graphWrapper: undefined,
  model: undefined,
};

export const GraphContext: Context<IGraphContext> = createContext(defaultValue);
export const Provider = GraphContext.Provider;
export const Consumer = GraphContext.Consumer;

export default GraphContext;
