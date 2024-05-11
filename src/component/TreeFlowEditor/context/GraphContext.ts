import { Context, createContext, RefObject } from 'react';
import { Graph } from '@antv/x6';
import { NodeCompStore } from '../constant/Comp';

interface IGraphContext {
  graph: Graph;
}

const defaultValue: IGraphContext = {} as any;

export const GraphContext: Context<IGraphContext> = createContext(defaultValue);

export default GraphContext;
