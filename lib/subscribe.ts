export type SubscribeArgs<T extends object = object> = {
  key?: keyof T;
  notifyInSync?: boolean;
};

export const SUBSCRIBE_KEY = "valtio:subscribe";

export function subscribe<T extends object = object>(
  args: SubscribeArgs<T> = {},
): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (typeof descriptor.value === "function") {
      Reflect.defineMetadata(SUBSCRIBE_KEY, args, descriptor.value);
    }
  };
}

export function isSubscribeFunction(
  value: unknown,
): value is (value: unknown) => void {
  return (
    value instanceof Function && Reflect.hasOwnMetadata(SUBSCRIBE_KEY, value)
  );
}
