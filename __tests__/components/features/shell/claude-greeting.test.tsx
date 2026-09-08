import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import translations from "#/i18n/translation.json";

const mockMe = vi.fn();
vi.mock("#/components/features/shell/sidebar/use-gateway-me", async () => {
  const actual = await vi.importActual<
    typeof import("#/components/features/shell/sidebar/use-gateway-me")
  >("#/components/features/shell/sidebar/use-gateway-me");
  return { ...actual, useGatewayMe: () => mockMe() };
});
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) =>
      (
        (translations as Record<string, Record<string, string>>)[key]?.en ?? key
      ).replace(/\{\{(\w+)\}\}/g, (_, k) => opts?.[k] ?? ""),
  }),
}));

import { ClaudeGreeting } from "#/components/features/shell/home/claude-greeting";

const at = (hour: number) => () => new Date(2026, 8, 7, hour, 0, 0);

describe("ClaudeGreeting", () => {
  it("greets a member by first name according to the hour", () => {
    mockMe.mockReturnValue({
      status: "member",
      user: { name: "Sait Yasin" },
      isGuest: false,
    });
    const { rerender } = render(<ClaudeGreeting now={at(9)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Good morning, Sait",
    );
    rerender(<ClaudeGreeting now={at(14)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Good afternoon, Sait",
    );
    rerender(<ClaudeGreeting now={at(21)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Good evening, Sait",
    );
  });

  it("uses the guest greeting for guests and while loading", () => {
    mockMe.mockReturnValue({
      status: "guest",
      user: { name: "Misafir" },
      isGuest: true,
    });
    const { rerender } = render(<ClaudeGreeting now={at(9)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "What shall we do today?",
    );
    mockMe.mockReturnValue({ status: "loading", user: null, isGuest: true });
    rerender(<ClaudeGreeting now={at(9)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "What shall we do today?",
    );
  });
});
