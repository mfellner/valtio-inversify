import { Container, inject, injectable } from "inversify";
import { derived, subscribe, valtio, valtioProxyMiddleware } from "./";

describe("valtio-inversify", () => {
  const container = new Container();
  container.applyMiddleware(valtioProxyMiddleware);

  afterEach(() => {
    container.unbindAll();
  });

  describe("subscribe", () => {
    test("subscribe to whole store (using instance method)", () => {
      const onUpdate = jest.fn();

      @valtio()
      @injectable()
      class MyStore {
        count = 0;

        increment() {
          this.count += 1;
        }

        @subscribe({ notifyInSync: true })
        subscribe() {
          onUpdate(this.count);
        }
      }

      container.bind(MyStore).toSelf();
      const state = container.get(MyStore);

      expect(state.count).toBe(0);
      state.increment();
      state.increment();
      expect(state.count).toBe(2);
      expect(onUpdate).toHaveBeenCalledTimes(2);
      expect(onUpdate).toHaveBeenNthCalledWith(1, 1);
      expect(onUpdate).toHaveBeenNthCalledWith(2, 2);
    });

    test("subscribe to single key (using static method)", () => {
      const onUpdate = jest.fn();

      @valtio()
      @injectable()
      class MyStore {
        @subscribe<MyStore>({ key: "count", notifyInSync: true })
        static subscribe(count: number) {
          onUpdate(count);
        }

        count = 0;

        increment() {
          this.count += 1;
        }
      }

      container.bind(MyStore).toSelf();
      const state = container.get(MyStore);

      expect(state.count).toBe(0);
      state.increment();
      state.increment();
      expect(state.count).toBe(2);
      expect(onUpdate).toHaveBeenCalledTimes(2);
      expect(onUpdate).toHaveBeenNthCalledWith(1, 1);
      expect(onUpdate).toHaveBeenNthCalledWith(2, 2);
    });

    test("subscribe inside nested proxy", () => {
      const onUpdate = jest.fn();

      @valtio()
      @injectable()
      class NestedStore {
        count = 0;

        increment() {
          this.count += 1;
        }

        @subscribe({ notifyInSync: true })
        subscribe() {
          onUpdate(this.count);
        }
      }

      @valtio()
      @injectable()
      class MyStore {
        constructor(@inject(NestedStore) readonly nestedStore: NestedStore) {}
      }

      container.bind(NestedStore).toSelf();
      container.bind(MyStore).toSelf();
      const state = container.get(MyStore);

      expect(state.nestedStore.count).toBe(0);
      state.nestedStore.increment();
      state.nestedStore.increment();
      expect(state.nestedStore.count).toBe(2);
      expect(onUpdate).toHaveBeenCalledTimes(2);
      expect(onUpdate).toHaveBeenNthCalledWith(1, 1);
      expect(onUpdate).toHaveBeenNthCalledWith(2, 2);
    });
  });

  describe("derive", () => {
    test("derive value using an accessor function", () => {
      @valtio()
      @injectable()
      class MyStore {
        count = 0;

        incrementBy(n: number) {
          this.count += n;
        }

        @derived({ sync: true })
        get squaredCount() {
          return this.count * this.count;
        }
      }

      container.bind(MyStore).toSelf();
      const state = container.get(MyStore);
      state.incrementBy(2);
      expect(state.squaredCount).toBe(4);
    });
  });
});
