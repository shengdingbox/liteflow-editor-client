import { applyPatch, compare } from 'fast-json-patch';
import { action, makeObservable, observable, toJS } from 'mobx';
import { deepObserveWithUndoRedoPatches } from './deepObserveWithUndoRedoPatches';
import { Patch } from './getUndoRedoPatch';

type Doc = {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
    state: string;
    country?: string;
  };
  inventory?: string[];
};

class TestApp {
  constructor() {
    makeObservable(this);
    this._prev = toJS(this.document);
    this._disposable = deepObserveWithUndoRedoPatches(
      this.document,
      (undo, redo) => {
        if (this._isPatching) return;
        // Get patch from compare
        const snapshot = toJS(this.document);
        this.fjpUndos.push(compare(snapshot, this._prev));
        this.fjpRedos.push(compare(this._prev, snapshot));
        this._prev = snapshot;

        // Get patch from our undo / redo methods
        this.undos.push(undo);
        this.redos.push(redo);
      },
    );
  }

  @observable document: Doc = {
    name: 'steve',
    age: 93,
    address: {
      street: '12 Monroe Ave',
      city: 'Chicago',
      state: 'Illinois',
    },
    inventory: ['keys', 'phone', 'wallet'],
  };

  redos: Patch[] = [];
  undos: Patch[] = [];

  fjpRedos: Patch[] = [];
  fjpUndos: Patch[] = [];

  _disposable: () => void;
  _isPatching = false;
  _prev: Doc;

  @action update = (fn: (doc: Doc) => void) => {
    fn(this.document);
  };

  @action patch = (patch: Patch) => {
    this._isPatching = true;
    applyPatch(this.document, patch);
    this._isPatching = false;
  };
}

describe('The test app', () => {
  it('Updates the document', async () => {
    const app = new TestApp();
    app.update((d) => d.age++);
    expect(app.document.age).toBe(94);
  });

  it('Creates undos and redos', async () => {
    const app = new TestApp();
    app.update((d) => d.age++);
    expect(app.undos.length).toBe(1);
    expect(app.redos.length).toBe(1);
    app.update((d) => d.age++);
    expect(app.undos.length).toBe(2);
    expect(app.redos.length).toBe(2);
  });
});

describe('When replacing...', () => {
  it('Creates the correct patches', async () => {
    const app = new TestApp();
    app.update((d) => (d.age = 4));
    expect(app.document.age).toBe(4);
    expect(app.undos[0]).toMatchObject([
      {
        op: 'replace',
        path: '/age',
        value: 93,
      },
    ]);
    expect(app.redos[0]).toMatchObject([
      {
        op: 'replace',
        path: '/age',
        value: 4,
      },
    ]);
  });

  it('undoes and redoes correctly', async () => {
    const app = new TestApp();
    app.update((d) => (d.age = 4));
    expect(app.document.age).toBe(4);
    app.patch(app.undos[0]);
    expect(app.document.age).toBe(93);
    app.patch(app.redos[0]);
    expect(app.document.age).toBe(4);
  });

  it('produces the same result as fjp', async () => {
    const ctrl = new TestApp();
    ctrl.update((d) => (d.age = 4));
    ctrl.patch(ctrl.fjpUndos[0]);
    ctrl.patch(ctrl.fjpRedos[0]);
    const app = new TestApp();
    app.update((d) => (d.age = 4));
    app.patch(app.undos[0]);
    app.patch(app.redos[0]);
    expect(app.document).toMatchObject(ctrl.document);
  });
});

describe('When adding...', () => {
  it('Creates the correct patches', async () => {
    const app = new TestApp();
    app.update((d) => (d.address.country = 'United States'));
    expect(app.document.address.country).toBe('United States');
    expect(app.undos[0]).toMatchObject([
      {
        op: 'remove',
        path: '/address/country',
      },
    ]);
    expect(app.redos[0]).toMatchObject([
      {
        op: 'add',
        path: '/address/country',
        value: 'United States',
      },
    ]);
  });

  it('undoes and redoes correctly', async () => {
    const app = new TestApp();
    app.update((d) => (d.address.country = 'United States'));
    expect(app.document.address.country).toBe('United States');
    app.patch(app.undos[0]);
    expect(app.document.address.country).toBeUndefined();
    app.patch(app.redos[0]);
    expect(app.document.address.country).toBe('United States');
  });

  it('produces the same result as fjp', async () => {
    const ctrl = new TestApp();
    ctrl.update((d) => (d.address.country = 'United States'));
    ctrl.patch(ctrl.fjpUndos[0]);
    ctrl.patch(ctrl.fjpRedos[0]);
    const app = new TestApp();
    app.update((d) => (d.address.country = 'United States'));
    app.patch(app.undos[0]);
    app.patch(app.redos[0]);
    expect(app.document).toMatchObject(ctrl.document);
  });
});

describe('When updating...', () => {
  it('Creates the correct patches', async () => {
    const app = new TestApp();
    app.update((d) => (d.inventory = ['sand']));
    expect(app.document.inventory).toMatchObject(['sand']);
    expect(app.undos[0]).toMatchObject([
      {
        op: 'replace',
        path: '/inventory',
        value: ['keys', 'phone', 'wallet'],
      },
    ]);
    expect(app.redos[0]).toMatchObject([
      {
        op: 'replace',
        path: '/inventory',
        value: ['sand'],
      },
    ]);
  });
});

describe('When deleting...', () => {
  it('Creates the correct patches', async () => {
    const app = new TestApp();
    app.update((d) => delete d.inventory);
    expect(app.document.inventory).toBeUndefined();
    expect(app.undos[0]).toMatchObject([
      {
        op: 'add',
        path: '/inventory',
        value: ['keys', 'phone', 'wallet'],
      },
    ]);
    expect(app.redos[0]).toMatchObject([
      {
        op: 'remove',
        path: '/inventory',
      },
    ]);
  });

  it('undoes and redoes correctly', async () => {
    const app = new TestApp();
    app.update((d) => delete d.inventory);
    expect(app.document.inventory).toBeUndefined();
    app.patch(app.undos[0]);
    expect(app.document.inventory).toMatchObject(['keys', 'phone', 'wallet']);
    app.patch(app.redos[0]);
    expect(app.document.inventory).toBeUndefined();
  });

  it('produces the same result as fjp', async () => {
    const ctrl = new TestApp();
    ctrl.update((d) => delete d.inventory);
    ctrl.patch(ctrl.fjpUndos[0]);
    ctrl.patch(ctrl.fjpRedos[0]);
    const app = new TestApp();
    app.update((d) => delete d.inventory);
    app.patch(app.undos[0]);
    app.patch(app.redos[0]);
    expect(app.document).toMatchObject(ctrl.document);
  });
});

describe('When splicing...', () => {
  it('Creates the correct patches', async () => {
    const app = new TestApp();
    app.update((d) => d.inventory!.splice(1, 2, 'sand'));
    expect(app.document.inventory).toMatchObject(['keys', 'sand']);
    expect(app.undos[0]).toMatchObject([
      {
        op: 'remove',
        path: '/inventory/1',
      },
      {
        op: 'add',
        path: '/inventory/1',
        value: 'phone',
      },
      {
        op: 'add',
        path: '/inventory/2',
        value: 'wallet',
      },
    ]);
    expect(app.redos[0]).toMatchObject([
      {
        op: 'remove',
        path: '/inventory/1',
      },
      {
        op: 'remove',
        path: '/inventory/1',
      },
      {
        op: 'add',
        path: '/inventory/1',
        value: 'sand',
      },
    ]);
  });

  it('undoes and redoes correctly', async () => {
    const app = new TestApp();
    app.update((d) => d.inventory!.splice(1, 2, 'sand'));
    expect(app.document.inventory).toMatchObject(['keys', 'sand']);
    app.patch(app.undos[0]);
    expect(app.document.inventory).toMatchObject(['keys', 'phone', 'wallet']);
    app.patch(app.redos[0]);
    expect(app.document.inventory).toMatchObject(['keys', 'sand']);
  });

  it('produces the same result as fjp', async () => {
    const ctrl = new TestApp();
    ctrl.update((d) => d.inventory!.splice(1, 2, 'sand'));
    ctrl.patch(ctrl.fjpUndos[0]);
    ctrl.patch(ctrl.fjpRedos[0]);
    const app = new TestApp();
    app.update((d) => d.inventory!.splice(1, 2, 'sand'));
    app.patch(app.undos[0]);
    app.patch(app.redos[0]);
    expect(app.document).toMatchObject(ctrl.document);
  });
});
