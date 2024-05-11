import { applyPatch } from 'fast-json-patch';
import { observable, makeObservable, action } from 'mobx';
import { EventEmitter } from 'events';
import { deepObserveWithUndoRedoPatches, Patch, UndoRedoPatch } from './patch';

export class HistoryStore<T = {}> extends EventEmitter {
  constructor(initialDocument: T) {
    super();
    this.document = initialDocument;
    makeObservable(this);
    this._disposable = deepObserveWithUndoRedoPatches(
      this.document,
      this.handleDocumentChange,
    );
  }

  debugChangeCount = 0;

  /** The (observable) document. */
  @observable document = {} as T;

  /** Whether the history is paused. */
  isPaused = false;

  /** Whether the history manager is disposed. */
  isDisposed = false;

  /** The current history frame. */
  pointer = -1;

  /** An array of JSON patches that represent the history of the document. */
  stack: UndoRedoPatch[] = [];

  /** Whether we're applying a patch. When true, we'll skip the next frame from being committed. */
  isPatching = false;

  /** Whether the document changed while the history was paused. */
  didChangeWhilePaused = false;

  /** A disposable for the history reaction. */
  _disposable?: () => void;

  /**
   * Called by deepObserve when the document changes.
   * @param undo - The undo patch
   * @param redo - The redo patch
   * @private
   */
  private handleDocumentChange = (undo: Patch, redo: Patch) => {
    const { didChangeWhilePaused, isPatching, isPaused, stack } = this;

    this.debugChangeCount++;

    const undoredo = { undo, redo };

    // Emit a change event with the patches
    this.emit('change', undoredo);

    // If the change was causd by patching the document...
    if (isPatching) {
      // Turn off the isPatching flag and don't create a new patch
      this.isPatching = false;
      return;
    }

    const len = stack.length;

    if (isPaused) {
      // If paused...
      // If this is the first change since we paused...
      if (!didChangeWhilePaused) {
        // Mark that the document changed while history was paused
        this.didChangeWhilePaused = true;

        // Increment pointer
        this.pointer++;

        // Remove any pending redos
        if (len > this.pointer) {
          stack.splice(this.pointer, len - this.pointer);
        }

        // Add the new undo / redo patch
        stack.push(undoredo);
      } else {
        // If we've already changed while paused, then push the
        // new "redo" operations to the current patch's "redo".
        // No need to trim here, as we will have already trimmed.
        stack[this.pointer].redo.push(...redo);
      }
    } else {
      // If not paused...

      // Increment pointer
      this.pointer++;

      // Remove any pending redos
      if (len > this.pointer) {
        stack.splice(this.pointer, len - this.pointer);
      }

      // Add the new undo / redo patch
      stack.push(undoredo);
      this.emit('commit', null);
    }
  };

  /**
   * An action that applies a patch to the document.
   * @param patch - The patch to apply.
   * @public
   */
  @action patchDocument = (patch: Patch) => {
    const { document } = this;

    if (this.isPatching) {
      throw Error('Tried to patch while patching');
    }

    this.isPatching = true;
    try {
      applyPatch(document, patch);
    } catch (e) {
      console.error(e, patch);
    }

    return this;
  };

  /**
   * Dispose the history. A disposed history will no longer respond to changes in the document.
   * @public
   */
  dispose = () => {
    this._disposable?.();
  };

  /**
   * Undo to the previous frame.
   * @public
   */
  undo = () => {
    const { isPaused, pointer, stack, didChangeWhilePaused } = this;

    if (this.isPatching) {
      throw Error('Tried to undo while patching');
    }

    if (isPaused) {
      this.resume(); // Resume if paused
    }

    // If we can undo...
    if (pointer >= 0 || didChangeWhilePaused) {
      // Patch in the pointed-to undoredo's redo patch
      this.patchDocument(stack[pointer].undo);

      // Decrement the pointer
      this.pointer--;

      this.emit('commit', null);
      this.emit('undo', null);
    }

    return this;
  };

  /**
   * Redo to the next frame.
   * @public
   */
  redo = () => {
    const { isPaused, pointer, stack } = this;

    if (this.isPatching) {
      throw Error('Tried to redo while patching');
    }

    if (isPaused) {
      this.resume(); // Resume if paused
    }

    // If we can redo...
    if (pointer < stack.length - 1) {
      // Increment the pointer
      this.pointer++;

      // Patch in the pointed-to undoredo's redo patch
      this.patchDocument(stack[this.pointer].redo);

      this.emit('commit', null);
      this.emit('redo', null);
    }

    return this;
  };

  /**
   * Pause the history.
   * @public
   */
  pause = () => {
    const { isPaused } = this;

    if (this.isPatching) {
      throw Error('Tried to pause while patching');
    }

    // If we can pause...
    if (!isPaused) {
      this.isPaused = true;
      this.didChangeWhilePaused = false;

      this.emit('paused-history');
    }

    return this;
  };

  /**
   * Resume (unpause) the history.
   * @public
   */
  resume = () => {
    const { isPaused, didChangeWhilePaused } = this;

    if (this.isPatching) {
      throw Error('Tried to resume while patching');
    }

    if (isPaused) {
      this.isPaused = false;
      this.didChangeWhilePaused = false;

      if (didChangeWhilePaused) {
        this.emit('commit', null);
      }

      this.emit('resumed-history');
    }
    return this;
  };
}
