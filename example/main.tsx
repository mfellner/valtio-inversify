import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { container } from "./container";
import { RootStore } from "./model";
import { StoreProvider } from "./store-provider";

async function main() {
  const rootStore = await container.getAsync(RootStore);

  const element = document.getElementById("root");

  if (element) {
    createRoot(element).render(
      <StrictMode>
        <StoreProvider rootStore={rootStore}>
          <App />
        </StoreProvider>
      </StrictMode>,
    );
  }
}

main().catch(console.error);
