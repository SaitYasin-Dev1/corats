import { fireEvent, render, screen } from "@testing-library/react";
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
vi.mock("#/components/features/shell/sidebar/use-gateway-me", async () => {
  const actual = await vi.importActual<
    typeof import("#/components/features/shell/sidebar/use-gateway-me")
  >("#/components/features/shell/sidebar/use-gateway-me");
  return {
    ...actual,
    useGatewayMe: () => ({
      status: "member",
      user: { name: "Sait" },
      isGuest: false,
    }),
  };
});
vi.mock("#/hooks/query/use-workspace-session", async () => {
  const actual = await vi.importActual<
    typeof import("#/hooks/query/use-workspace-session")
  >("#/hooks/query/use-workspace-session");
  return {
    ...actual,
    useWorkspaceSession: () => ({
      data: {
        baseUrl: "http://127.0.0.1:18000/api/conversations/abc/workspace/",
      },
      isLoading: false,
      isError: false,
      error: null,
    }),
  };
});

import { ChatMessage } from "#/components/features/chat/chat-message";

describe("ChatMessage in hosted (claude) mode", () => {
  it("renders a user turn as a full-width row with initial avatar and cream bubble", () => {
    render(<ChatMessage type="user" message="Merhaba" />);
    const turn = screen.getByTestId("user-message");
    expect(turn).toHaveAttribute("data-shell-turn", "user");
    expect(screen.getByTestId("shell-turn-avatar")).toHaveTextContent("S");
    expect(screen.getByTestId("shell-turn-body").className).toContain(
      "bg-[var(--cool-grey-900)]",
    );
    expect(turn).toHaveTextContent("Merhaba");
  });

  it("renders an agent turn without a bubble, with the brand mark and a hover action bar", async () => {
    const onAction = vi.fn();
    render(
      <ChatMessage
        type="agent"
        message="Selam!"
        actions={[
          { icon: <span>R</span>, onClick: onAction, tooltip: "Retry" },
        ]}
      />,
    );
    const turn = screen.getByTestId("agent-message");
    expect(turn).toHaveAttribute("data-shell-turn", "agent");
    expect(screen.getByTestId("shell-turn-body").className).not.toContain(
      "bg-[var(--cool-grey-900)]",
    );
    expect(screen.getByTestId("shell-turn-mark")).toBeInTheDocument();
    const bar = screen.getByTestId("shell-turn-actions");
    expect(bar.className).toContain("opacity-0");
    fireEvent.mouseEnter(turn);
    expect(bar.className).toContain("opacity-100");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onAction).toHaveBeenCalled();
  });

  it("resolves workspace-relative media in an agent turn against the fileserver", () => {
    render(
      <ChatMessage type="agent" message="![city](generated_media/img_1.png)" />,
    );
    const image = screen.getByTestId("chat-media-image");
    expect(image.getAttribute("src")).toBe(
      "http://127.0.0.1:18000/api/conversations/abc/workspace/generated_media/img_1.png",
    );
  });

  it("keeps the legacy bubble for pending user messages", () => {
    render(
      <ChatMessage
        type="user"
        message="gönderiliyor"
        pendingStatus="sending"
      />,
    );
    expect(screen.getByTestId("user-message")).not.toHaveAttribute(
      "data-shell-turn",
    );
  });
});
