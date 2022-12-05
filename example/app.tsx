import React, { useState } from "react";
import { useSnapshot } from "valtio";
import * as styles from "./app.module.css";
import { useStore } from "./store-provider";

function Gallery() {
  const { galleryStore } = useStore();
  const { images } = useSnapshot(galleryStore);
  const [itemName, setItemName] = useState("");

  const onItemNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemName(e.target.value);
  };

  const onItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onAddItemClicked();
    }
  };

  const onAddItemClicked = () => {
    if (!itemName) {
      return;
    }
    galleryStore.addImage({ name: itemName });
    setItemName("");
  };

  const onDeleteItemClicked = (id: string) => {
    galleryStore.removeImage(id);
  };

  return (
    <div>
      <h3>Gallery</h3>
      <input
        type="text"
        name="item-name"
        aria-label="item-name"
        onChange={onItemNameChanged}
        value={itemName}
        onKeyDown={onItemKeyDown}
      />
      <button name="add-item" aria-label="add-item" onClick={onAddItemClicked}>
        add item
      </button>
      <ul className={styles.list}>
        {images.map((img) => (
          <li key={img.id}>
            <button
              name="delete-item"
              aria-label="delete-item"
              onClick={() => onDeleteItemClicked(img.id)}
            >
              x
            </button>
            <img src={img.url} alt={img.name} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <Gallery />
    </div>
  );
}
