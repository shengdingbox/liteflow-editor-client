import { createContext } from 'react';
import { Graph } from '@antv/x6';

/**
 * graph: Graph实例
 * graphWrapper: Graph的容器
 */
interface IGraphContext {
  model: any;
  graph: Graph | undefined;
  graphWrapper: HTMLDivElement | undefined;
}

const defaultValue: IGraphContext = {
  graph: undefined,
  graphWrapper: undefined,
  model: undefined,
};

export const GraphContext = createContext<IGraphContext>(defaultValue);
export const GraphProvider = GraphContext.Provider;
export const GraphConsumer = GraphContext.Consumer;

export default GraphContext;
