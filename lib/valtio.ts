import { ValtioStore } from "./types";

export function valtio() {
  return <Class extends ValtioStore<InstanceType<Class>>>(target: Class) => {
    Reflect.defineMetadata("valtio:store", true, target);
    return target;
  };
}
