import { inject, injectable, unmanaged } from "inversify";
import { derived, subscribe, valtio } from "../lib";

export type Image = {
  id: string;
  name: string;
  url: string;
};

@valtio()
@injectable()
export class SerializableGalleryState {
  readonly imageRecord: Record<string, Image> = {};

  constructor(
    @unmanaged() state?: Pick<SerializableGalleryState, "imageRecord">,
  ) {
    Object.assign(this, state);
  }

  @subscribe()
  protected onUpdated() {
    this.serialize();
  }

  static deserialize(): SerializableGalleryState {
    const json = window.localStorage.getItem(SerializableGalleryState.name);
    return json
      ? new SerializableGalleryState(JSON.parse(json))
      : new SerializableGalleryState();
  }

  private serialize() {
    window.localStorage.setItem(
      SerializableGalleryState.name,
      JSON.stringify(this),
    );
  }

  toJSON() {
    return {
      imageRecord: this.imageRecord,
    };
  }
}

@valtio()
@injectable()
export class GalleryStore {
  constructor(
    @inject(SerializableGalleryState) readonly state: SerializableGalleryState,
  ) {}

  @derived()
  get images() {
    return Object.values(this.state.imageRecord);
  }

  addImage(item: Pick<Image, "name">) {
    const id = btoa(Math.random().toString());
    const image = (this.images.length % 10) + 1;
    this.state.imageRecord[id] = {
      ...item,
      id,
      url: `https://placekitten.com/200/200?image=${image}`,
    };
  }

  removeImage(id: string) {
    delete this.state.imageRecord[id];
  }
}

@valtio()
@injectable()
export class RootStore {
  constructor(@inject(GalleryStore) readonly galleryStore: GalleryStore) {}
}
