import { Graph } from '@antv/x6';
import { cloneDeep } from 'lodash';

export const history = {
  $historyStack: [] as any[],
  $cursorIndex: 0 as number,
  $graph: undefined as Graph | undefined,
  init(graph: Graph) {
    this.$historyStack = [cloneDeep(graph.toJSON())];
    this.$cursorIndex = 0;
    this.$graph = graph;
  },
  canRedo() {
    return this.$cursorIndex < this.$historyStack.length - 1;
  },
  canUndo() {
    return this.$cursorIndex > 0;
  },
  push(nextState: any) {
    if (this.$historyStack.length > this.$cursorIndex + 1) {
      this.$historyStack.splice(
        this.$cursorIndex + 1,
        this.$historyStack.length - this.$cursorIndex,
      );
    }

    if (nextState) {
      this.$historyStack.push(nextState);
    } else {
      this.$historyStack.push(cloneDeep(this.$graph.toJSON()));
    }
    this.$cursorIndex++;
    this.$graph.trigger('toolBar:forceUpdate');
    this.$graph.trigger('settingBar:forceUpdate');
  },
  redo() {
    if (this.canRedo()) {
      this.$cursorIndex++;
      this.$graph.fromJSON(this.$historyStack[this.$cursorIndex]);
      this.$graph.trigger('toolBar:forceUpdate');
      this.$graph.trigger('settingBar:forceUpdate');
    }
  },
  undo() {
    if (this.canUndo()) {
      this.$cursorIndex--;
      this.$graph.fromJSON(this.$historyStack[this.$cursorIndex]);
      this.$graph.trigger('toolBar:forceUpdate');
      this.$graph.trigger('settingBar:forceUpdate');
    }
  },
  cleanHistory() {
    this.$historyStack = [cloneDeep(this.$graph.toJSON())];
    this.$cursorIndex = 0;
    this.$graph.trigger('toolBar:forceUpdate');
    this.$graph.trigger('settingBar:forceUpdate');
  },
  length() {
    return this.$historyStack.length ? this.$historyStack.length - 1 : 0;
  },
} as Record<string, any>;

export const useHistory = () => {
  // const { history } = useContext(GraphContext);
  return history;
};
