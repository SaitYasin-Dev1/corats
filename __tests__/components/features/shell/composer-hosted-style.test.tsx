import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("#/api/agent-server-config", async () => {
  const actual = await vi.importActual<
    typeof import("#/api/agent-server-config")
  >("#/api/agent-server-config");
  return { ...actual, isHostedMode: () => true };
});
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

import { ChatSendButton } from "#/components/features/chat/chat-send-button";

describe("composer in hosted (claude) mode", () => {
  it("renders the terracotta rounded send button with a white arrow", () => {
    render(
      <ChatSendButton
        buttonClassName=""
        handleSubmit={() => {}}
        disabled={false}
      />,
    );
    const btn = screen.getByTestId("submit-button");
    expect(btn.className).toContain("bg-[var(--oh-accent)]");
    expect(btn.className).toContain("rounded-lg");
    expect(btn).toHaveAttribute("aria-label", "SHELL$SEND");
    // lucide-react maps the `color` prop to the SVG's `stroke` attribute
    // (there is no literal `color` attribute on the rendered <svg>).
    expect(btn.querySelector("svg")?.getAttribute("stroke")).toBe("#ffffff");
  });

  it("keeps the disabled state visible but muted", () => {
    render(
      <ChatSendButton buttonClassName="" handleSubmit={() => {}} disabled />,
    );
    const btn = screen.getByTestId("submit-button");
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("disabled:opacity-40");
  });
});
