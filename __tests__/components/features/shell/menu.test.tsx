/* eslint-disable i18next/no-literal-string -- test harness intentionally uses literal labels */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ShellMenu, ShellMenuItem } from "#/components/features/shell/menu";

vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({
    currentPath: "/",
    conversationId: null,
    isNavigating: false,
    navigate: vi.fn(),
  }),
}));

/** Small harness holding `open` state, plus a sibling toggle button that can
 * either sit outside the menu (default) or be wired up as the ignored
 * click target via `ignoreOutsideClickRef`. */
function Harness({ ignoreToggle = false }: { ignoreToggle?: boolean }) {
  const [open, setOpen] = React.useState(true);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  return (
    <div>
      <button ref={toggleRef} type="button" data-testid="toggle">
        toggle
      </button>
      <button type="button" data-testid="outside">
        outside
      </button>
      <ShellMenu
        open={open}
        onClose={() => setOpen(false)}
        testId="test-menu"
        ignoreOutsideClickRef={ignoreToggle ? toggleRef : undefined}
      >
        <ShellMenuItem label="Item" onClick={() => {}} />
      </ShellMenu>
    </div>
  );
}

describe("ShellMenu", () => {
  it("renders nothing when closed", () => {
    render(
      <ShellMenu open={false} onClose={() => {}} testId="closed-menu">
        <ShellMenuItem label="Item" onClick={() => {}} />
      </ShellMenu>,
    );
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes on Escape", () => {
    render(<Harness />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes on an outside click", () => {
    render(<Harness />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("does not close on a click inside the ignoreOutsideClickRef element", () => {
    render(<Harness ignoreToggle />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("toggle"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
