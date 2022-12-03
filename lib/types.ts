import { interfaces } from "inversify";

export type ValtioStore<T = unknown> = interfaces.Newable<T>;
