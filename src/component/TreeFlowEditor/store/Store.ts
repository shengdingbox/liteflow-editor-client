import { makeObservable, action, transaction } from 'mobx';
import { HistoryStore } from './HistoryStore';

interface DocumentModel {
  box: {
    point: {
      x: number;
      y: number;
    };
    count: 0;
  };
}

export class Store extends HistoryStore<DocumentModel> {
  constructor() {
    super({
      box: {
        point: {
          x: 50,
          y: 160,
        },
        count: 0,
      },
    });
    makeObservable(this);
    this.on('resumed-history', () => {
      if (this.state !== 'idle') {
        this.state = 'idle';
      }
    });
  }

  // just for this example

  private startPoint = { x: 0, y: 0 };
  private downPoint = { x: 0, y: 0 };
  private state: 'idle' | 'pointing' | 'dragging' = 'idle';

  @action setState = (state: 'idle' | 'pointing' | 'dragging') => {
    this.state = state;
  };

  @action moveBox = (point: { x: number; y: number }) => {
    const { box } = this.document;
    box.point = point;
    box.count++;
  };

  startDraggingBox = (point: { x: number; y: number }) => {
    this.downPoint = point;
    this.setState('pointing');
    this.startPoint = { ...this.document.box.point };
  };

  dragBox = (point: { x: number; y: number }) => {
    const { downPoint, startPoint } = this;
    // Offset between current point and point where we started pointing
    const offset = {
      x: point.x - downPoint.x,
      y: point.y - downPoint.y,
    };
    switch (this.state) {
      case 'pointing': {
        // If we've dragged more than 3 pixels...
        if (Math.hypot(offset.x, offset.y) > 3) {
          // Start dragging and Pause the undo / redo history
          this.setState('dragging');
          this.pause();
        }
        break;
      }
      case 'dragging': {
        this.moveBox({
          x: startPoint.x + offset.x,
          y: startPoint.y + offset.y,
        });
        break;
      }
    }
  };

  stopDraggingBox = () => {
    if (this.state === 'dragging') {
      // Resume undo stack when drag ends.
      this.resume();
    }
    // Either way, reset state
    this.setState('idle');
  };

  moveBoxToPoint = (point: { x: number; y: number }) => {
    this.moveBox({
      x: point.x - 50,
      y: point.y - 50,
    });
  };
}
