/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import App from "./app";
import { container } from "./container";
import { RootStore } from "./model";
import { StoreProvider } from "./store-provider";

jest.mock("./app.module.css", () => ({}));

describe("App", () => {
  test("add and remove items", async () => {
    const rootStore = await container.getAsync(RootStore);

    render(
      <StoreProvider rootStore={rootStore}>
        <App />
      </StoreProvider>,
    );

    fireEvent.change(screen.getByLabelText("item-name"), {
      target: { value: "Test" },
    });

    fireEvent.click(screen.getByLabelText("add-item"));

    expect(await screen.findByLabelText("item-name")).toHaveValue("");
    expect(await screen.findByAltText("Test")).toHaveAttribute("src");

    fireEvent.click(screen.getByLabelText("delete-item"));
    expect(await screen.findByLabelText("item-name")).toHaveValue("");
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });
});
