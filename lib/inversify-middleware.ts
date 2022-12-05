import { interfaces } from "inversify";
import { derive as valtioDerive, subscribeKey } from "valtio/utils";
import { proxy, subscribe as valtioSubscribe } from "valtio/vanilla";
import { DerivedArgs, DERIVED_KEY, isDerivedProperty } from "./derived";
import { isSubscribeFunction, SubscribeArgs, SUBSCRIBE_KEY } from "./subscribe";
import { ValtioStore } from "./types";

function isValtioStoreClass(identifier: unknown): identifier is ValtioStore {
  return (
    typeof identifier === "function" &&
    Reflect.getMetadata("valtio:store", identifier)
  );
}

/**
 * Middleware for Inversify to add support for valtio-annotated classs.
 *
 * @see https://github.com/inversify/InversifyJS/blob/master/wiki/middleware.md
 * @example
 * import { Container } from "inversify";
 * const container = new Container();
 * container.applyMiddleware(createProxy);
 */
export function valtioProxyMiddleware(
  planAndResolve: interfaces.Next,
): interfaces.Next {
  return (args: interfaces.NextArgs) => proxyfy(planAndResolve(args));
}

function proxyfy<T extends object>(value: T): T {
  if (value === null || !isValtioStoreClass(value.constructor)) {
    return value;
  }
  for (const [k, v] of Object.entries(value)) {
    value[k as keyof T] = proxyfy(v);
  }

  const p = proxy(value);

  // Inspect static class properties
  for (const [name, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(value.constructor),
  )) {
    handleProperty(p, name, descriptor);
  }
  // Inspect instance properties
  for (const [name, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(Object.getPrototypeOf(value)),
  )) {
    handleProperty(p, name, descriptor);
  }
  return p;
}

function handleProperty(
  proxy: object,
  name: string,
  descriptor: PropertyDescriptor,
) {
  if (isSubscribeFunction(descriptor.value)) {
    const boundCallback = descriptor.value.bind(proxy);

    const { key, notifyInSync } = Reflect.getOwnMetadata(
      SUBSCRIBE_KEY,
      descriptor.value,
    ) as SubscribeArgs;
    if (key) {
      subscribeKey(proxy, key, boundCallback, notifyInSync);
    } else {
      valtioSubscribe(proxy, boundCallback, notifyInSync);
    }
    return;
  }
  if (isDerivedProperty(descriptor.get)) {
    const { sync } = Reflect.getOwnMetadata(
      DERIVED_KEY,
      descriptor.get,
    ) as DerivedArgs;

    valtioDerive<object, any>(
      {
        [name]: (get) => descriptor.get?.apply(get(proxy)),
      },
      { proxy, sync },
    );
    return;
  }
}
