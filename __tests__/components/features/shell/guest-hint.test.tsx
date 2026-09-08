import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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
    t: (key: string) =>
      (translations as Record<string, Record<string, string>>)[key]?.en ?? key,
  }),
}));

import {
  GUEST_HINT_DISMISSED_KEY,
  GuestHint,
} from "#/components/features/shell/home/guest-hint";

beforeEach(() => {
  localStorage.removeItem(GUEST_HINT_DISMISSED_KEY);
});

describe("GuestHint", () => {
  it("shows for a guest with a signup link and can be dismissed persistently", () => {
    mockMe.mockReturnValue({ status: "guest", user: null, isGuest: true });
    const { rerender } = render(<GuestHint />);
    expect(
      screen.getByText("You're trying Corat as a guest"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Sign up to keep your chats" }),
    ).toHaveAttribute("href", "/signup");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("You're trying Corat as a guest")).toBeNull();
    expect(localStorage.getItem(GUEST_HINT_DISMISSED_KEY)).toBe("1");
    rerender(<GuestHint />);
    expect(screen.queryByText("You're trying Corat as a guest")).toBeNull();
  });

  it("is hidden for members and while loading", () => {
    mockMe.mockReturnValue({
      status: "member",
      user: { name: "Ada" },
      isGuest: false,
    });
    const { container, rerender } = render(<GuestHint />);
    expect(container).toBeEmptyDOMElement();
    mockMe.mockReturnValue({ status: "loading", user: null, isGuest: true });
    rerender(<GuestHint />);
    expect(container).toBeEmptyDOMElement();
  });
});
