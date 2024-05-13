import { useContext } from 'react';
import { GraphContext } from '../context/GraphContext';

export const useGraph = () => {
  const grapher = useContext(GraphContext);
  return grapher.flowGraph;
};
