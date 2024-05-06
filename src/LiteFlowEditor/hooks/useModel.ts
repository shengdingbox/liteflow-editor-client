let model: any;

export const setModel = (_newModel: any) => {
  model = _newModel;
};

export const useModel = () => {
  return model;
};
