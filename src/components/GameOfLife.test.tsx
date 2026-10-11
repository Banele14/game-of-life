import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { GameOfLife } from "./GameOfLife";

// Canvas pixels are covered by the Playwright tests; these check behaviour.
function setup() {
  const user = userEvent.setup();
  render(<GameOfLife />);
  return {
    user,
    generation: () => screen.getByTestId("generation").textContent,
    population: () => screen.getByTestId("population").textContent,
    status: () => screen.getByTestId("status").textContent,
    patternName: () => screen.getByTestId("pattern-name").textContent,
    patternSelect: () => screen.getByRole("combobox", { name: "Pattern" }),
  };
}

describe("<GameOfLife />", () => {
  it("opens paused on the Gosper glider gun", () => {
    const { generation, population, status, patternName } = setup();
    expect(patternName()).toBe("Gosper glider gun");
    expect(generation()).toBe("0");
    expect(population()).toBe("36");
    expect(status()).toBe("Paused");
  });

  it("steps one generation", async () => {
    const { user, generation } = setup();
    await user.click(screen.getByRole("button", { name: "Step" }));
    expect(generation()).toBe("1");
  });

  it("switches between play and pause", async () => {
    const { user, status } = setup();
    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(status()).toBe("Running");
    expect(screen.getByRole("button", { name: "Step" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(status()).toBe("Paused");
  });

  it("clears the board and won't play an empty one", async () => {
    const { user, population, patternName, status } = setup();
    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(population()).toBe("0");
    expect(patternName()).toBe("Empty");
    expect(status()).toBe("Empty");
    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
  });

  it("loads a pattern from the menu, and can load the same one again", async () => {
    const { user, generation, population, patternName, patternSelect } = setup();
    await user.selectOptions(patternSelect(), "pulsar");
    expect(patternName()).toBe("Pulsar");
    expect(population()).toBe("48");

    await user.click(screen.getByRole("button", { name: "Step" }));
    await user.selectOptions(patternSelect(), "pulsar");
    expect(generation()).toBe("0");
  });

  it("fills the board with random cells", async () => {
    const { user, population, patternName } = setup();
    await user.click(screen.getByRole("button", { name: "Random" }));
    expect(patternName()).toBe("Random");
    expect(Number(population())).toBeGreaterThan(0);
  });

  it("changes speed with the slider", () => {
    setup();
    // can't drag a slider in jsdom
    fireEvent.change(screen.getByRole("slider", { name: "Speed" }), { target: { value: "30" } });
    expect(screen.getByText("30/s")).toBeInTheDocument();
  });

  describe("keyboard shortcuts", () => {
    it("Space plays and pauses", async () => {
      const { user, status } = setup();
      await user.keyboard(" ");
      expect(status()).toBe("Running");
      await user.keyboard(" ");
      expect(status()).toBe("Paused");
    });

    it("→ steps, C clears, R randomises", async () => {
      const { user, generation, patternName } = setup();
      await user.keyboard("{ArrowRight}");
      expect(generation()).toBe("1");
      await user.keyboard("c");
      expect(patternName()).toBe("Empty");
      await user.keyboard("r");
      expect(patternName()).toBe("Random");
    });

    it("ignores Cmd/Ctrl combinations", async () => {
      const { user, patternName } = setup();
      await user.keyboard("{Meta>}r{/Meta}");
      await user.keyboard("{Control>}c{/Control}");
      expect(patternName()).toBe("Gosper glider gun");
    });

    it("leaves keys alone while a form control has focus", async () => {
      const { user, generation } = setup();
      screen.getByRole("slider", { name: "Speed" }).focus();
      await user.keyboard("{ArrowRight}");
      expect(generation()).toBe("0");
    });
  });
});
