import type { Operation } from 'fast-json-patch';

export type IChange = any;

export type Patch = Operation[];

export interface UndoRedoPatch {
  undo: Patch;
  redo: Patch;
}

export function getUndoRedoPatch(
  change: any, // IChange,
  parent: string,
): UndoRedoPatch {
  const redo: Patch = [];
  const undo: Patch = [];
  const { name, index, newValue, oldValue } = change;
  const path = (parent ? '/' + parent : '') + '/' + (name ?? index);

  switch (change.type) {
    case 'add': {
      undo.push({ op: 'remove', path });
      redo.push({ op: 'add', path, value: newValue });
      break;
    }
    case 'update': {
      undo.push({ op: 'replace', path, value: oldValue });
      redo.push({ op: 'replace', path, value: newValue });
      break;
    }
    case 'remove':
    case 'delete': {
      undo.push({ op: 'add', path, value: oldValue });
      redo.push({ op: 'remove', path });
      break;
    }
    case 'splice': {
      const { index, removed, removedCount, added, addedCount } = change;
      for (let i = 0; i < removedCount; i++) {
        redo.push({ op: 'remove', path });
      }
      for (let i = 0; i < addedCount; i++) {
        undo.push({ op: 'remove', path });
        redo.push({ op: 'add', path, value: added[i] });
      }
      for (let i = 0; i < removedCount; i++) {
        const path = (parent ? '/' + parent : '') + '/' + (i + index);
        undo.push({ op: 'add', path, value: removed[i] });
      }
      break;
    }
  }
  return { undo, redo };
}
