import { configure } from 'mobx';
import { deepObserve } from 'mobx-utils';
import { Patch, getUndoRedoPatch } from './getUndoRedoPatch';

export type IListenerWithPatches = (undo: Patch, redo: Patch) => void;

export function deepObserveWithUndoRedoPatches<T>(
  target: T,
  listener: IListenerWithPatches,
) {
  let undoStack: Patch[] = [];
  let redoStack: Patch[] = [];

  const notify = () => {
    if (undoStack.length || redoStack.length) {
      listener(undoStack.reverse().flat(), redoStack.flat());
      undoStack = [];
      redoStack = [];
    }
  };

  configure({
    reactionScheduler: (f): void => {
      f();
      notify();
    },
  });

  return deepObserve(target, (change: any, parent: string) => {
    const { undo, redo } = getUndoRedoPatch(change, parent);
    undoStack.push(undo);
    redoStack.push(redo);
  });
}
