export type DerivedArgs = {
  sync?: boolean;
};

export const DERIVED_KEY = "valtio:derived";

export function derived(args: DerivedArgs = {}): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    if (typeof descriptor.get === "function") {
      Reflect.defineMetadata(DERIVED_KEY, args, descriptor.get);
    }
  };
}

export function isDerivedProperty(value: unknown): value is () => unknown {
  return (
    value instanceof Function && Reflect.hasOwnMetadata(DERIVED_KEY, value)
  );
}
