import dva, { DvaInstance } from 'dva';
import createLoading from 'dva-loading';
import dvaImmer from 'dva-immer';
import { createMemoryHistory } from 'umi';
import EditorContext from './context/EditorContext';
import { Provider } from 'react-redux';
import { Store, AnyAction } from 'redux';

class FlowEditor {
  app: DvaInstance;
  RootComponent: React.FC;

  constructor() {
    this.app = createApp();
    this.RootComponent = this.app.start();
  }
}

function createApp() {
  const app = dva({
    history: createMemoryHistory(),
    onError(e) {
      console.error('flow editor dva error', e);
    },
    onReducer(reducer: any) {
      return (state: any, action: any) => {
        const newState = reducer(state, action);
        return newState;
      };
    },
  });
  app.use(createLoading());
  app.use(dvaImmer());
  app.router(() => <>Root</>);
  // app.model(model);

  const oldAppStart = app.start;
  app.start = function () {
    const myApp = app as any;
    if (!myApp._store) {
      oldAppStart.call(app);
    }

    const store = myApp._store;
    myApp._getProvider = getProvider.bind(null, store, myApp);

    return getProvider(store, this, myApp._router);
  };
  return app;
}

function getProvider(store: any, app: any, router: any) {
  return (props: any) => {
    <Provider context={EditorContext as any} store={store}>
      {router({ app, history: app._history, ...props })}
    </Provider>;
  };
}
