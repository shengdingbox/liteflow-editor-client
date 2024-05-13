import { Context, createContext, RefObject } from 'react';
import { Graph } from '@antv/x6';
import { Store } from '../store/Store';

interface IGraphContext {
  graph?: Graph;
  store?: Store;
}

const defaultValue: IGraphContext = {};

export const GraphContext: Context<IGraphContext> = createContext(defaultValue);

export default GraphContext;
