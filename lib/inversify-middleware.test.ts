import { Container, inject, injectable } from "inversify";
import { types } from "util";
import { valtio, valtioProxyMiddleware } from "./";

describe("valtioProxyMiddleware", () => {
  test("apply middleware and inject", () => {
    @injectable()
    class SomethingElse {}

    @valtio()
    @injectable()
    class MyStore {
      constructor(
        @inject(SomethingElse) public readonly somethingElse: SomethingElse,
      ) {}
    }

    const container = new Container();
    container.applyMiddleware(valtioProxyMiddleware);

    container.bind(SomethingElse).toSelf();
    container.bind(MyStore).toSelf();
    const state = container.get(MyStore);

    expect(state).toBeInstanceOf(MyStore);
    expect(types.isProxy(state)).toBe(true);

    expect(state.somethingElse).toBeInstanceOf(SomethingElse);
    expect(types.isProxy(state.somethingElse)).toBe(true);
  });
});
