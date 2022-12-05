import { Container } from "inversify";
import { valtioProxyMiddleware } from "../lib";
import { GalleryStore, RootStore, SerializableGalleryState } from "./model";

export const container = new Container();

container.applyMiddleware(valtioProxyMiddleware);

container
  .bind(SerializableGalleryState)
  .toDynamicValue(() => SerializableGalleryState.deserialize());
container.bind(GalleryStore).toSelf();
container.bind(RootStore).toSelf();
