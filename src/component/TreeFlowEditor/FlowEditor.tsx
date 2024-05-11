import EditorContext from './context/EditorContext';

class FlowEditor {
  app: DvaInstance;
  RootComponent: React.FC;

  constructor() {
    this.app = createApp();
    this.RootComponent = this.app.start();
  }
}
