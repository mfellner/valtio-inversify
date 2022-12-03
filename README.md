# valtio-inversify 🏭 <!-- omit in toc -->

[![Build Status](https://img.shields.io/github/workflow/status/mfellner/valtio-inversify/test?style=flat&colorA=000000&colorB=000000)](https://github.com/mfellner/valtio-inversify/actions?query=workflow%3Atest)
[![Codecov](https://img.shields.io/codecov/c/github/mfellner/valtio-inversify?colorA=000000&colorB=000000)](https://app.codecov.io/gh/mfellner/valtio-inversify)
[![Build Size](https://img.shields.io/bundlephobia/minzip/@mfellner/valtio-inversify?label=bundle%20size&style=flat&colorA=000000&colorB=000000)](https://bundlephobia.com/result?p=@mfellner/valtio-inversify)
[![Version](https://img.shields.io/npm/v/@mfellner/valtio-inversify?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@mfellner/valtio-inversify)
[![Downloads](https://img.shields.io/npm/dt/@mfellner/valtio-inversify.svg?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@mfellner/valtio-inversify)

- [Create valtio state from class-based stores using Inversify](#create-valtio-state-from-class-based-stores-using-inversify)
  - [Motivation](#motivation)
- [Define actions](#define-actions)
- [Subscribe](#subscribe)
  - [Subscribe to the whole state with instance methods](#subscribe-to-the-whole-state-with-instance-methods)
  - [Subscribe to a key with static methods](#subscribe-to-a-key-with-static-methods)
  - [Options](#options)
  - [⚠️ Unsubscribe not supported](#️-unsubscribe-not-supported)
- [Derive properties with accessor methods](#derive-properties-with-accessor-methods)
  - [Options](#options-1)

### Create valtio state from class-based stores using Inversify

valtio-inversify consists of TypeScript decorators and a middleware for [Inversify](https://inversify.io). It allows valtio stores...

- to be declared as injectable classes
- to declare actions as class methods
- to define subscriptions as (static) class methods
- to create derived properties with acessor methods

Existing [valtio](https://github.com/pmndrs/valtio) utilities can still be used like usual.

```ts
import { valtioProxyMiddleware, valtio } from "@mfellner/valtio-inversify";

@valtio()
@injectable()
class CounterStore {
  count = 0;

  increment() {
    this.count += 1;
  }
}

const container = new Container();
container.applyMiddleware(valtioProxyMiddleware);

const counter = container.get(CounterStore);
```

#### Motivation

This library builds on top of the officially documented pattern for [using classes](https://github.com/pmndrs/valtio/wiki/How-to-organize-actions#using-class) as stores (to organize actions).

valtio-inversify enables an object-oriented approach to state management and aims to
make state management code more maintainable and testable.

For instance, external dependencies like API clients can simply be injected into stores
with the help of inversify.

valtio-inversify was inspired by the work on [valtio-factory](http://github.com/mfellner/valtio-factory). If using Inversify is not an option for your own use case,
perhaps valtio-factory would be a better fit as it aims to solve similar problems
as this library.

### Define actions

Actions are declared as methods on the class.

### Subscribe

#### Subscribe to the whole state with instance methods

A class method annoted with `@subscribe()` will be subscribed to any state changes.

```ts
import { subscribe, valtio } from "@mfellner/valtio-inversify";

@valtio()
@injectable()
class CounterStore {
  count = 0;

  increment() {
    this.count += 1;
  }

  @subscribe()
  private onUpdated() {
    console.log("current count:", this.count);
  }
}
```

Subscription methods can be declared `private` or `protected` because they shouldn't be called externally.

#### Subscribe to a key with static methods

`@subscribe` takes an optional `key` argument to subscribe the annotated method
only to state changes on the given key.

The annotated method will receive the updated value as an argument.

Subscriptions by key can be declared as static methods.

```ts
@valtio()
@injectable()
class CounterStore {
  @subscribe({ key: "count" })
  static onCountUpdated(value: number) {
    // called when `count` changes
  }

  count = 0;
}
```

#### Options

- `@subscribe<T>` – For increased type safety, `@subscribe` can take an optional type argument.
- `@subscribe<T>({key?: keyof T})` – The annotated method will be subscribed to this key using `valtio/utils/subscribeKey`.
- `@subscribe({notifyInSync?: boolean})` – The subscription will be updated synchronously.

#### ⚠️ Unsubscribe not supported

There's currently no way to unsubscribe a subscription.

### Derive properties with accessor methods

Accessor ("getter") methods annoated with `@derived()` can return derived properties
based on the current state. The methods are internally wapped with `valtio/utils/derive`.

```ts
import { derived, valtio } from "@mfellner/valtio-inversify";

@valtio()
@injectable()
class CounterStore {
  count = 0;

  increment() {
    this.count += 1;
  }

  @derived()
  get squaredCount() {
    return this.count * this.count;
  }
}
```

#### Options

- `@derived({sync?: boolean})` – This optional parameter is passed on to valtio's `derive` utility function.
