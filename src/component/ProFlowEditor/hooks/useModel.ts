import { useContext } from 'react';
import { GraphContext } from '../context/GraphContext';

export const useModel = () => {
  const { model } = useContext(GraphContext);
  return model;
};
