import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import translations from "#/i18n/translation.json";

const mockMe = vi.fn();
const mockSignOut = vi.fn();
vi.mock("#/components/features/shell/sidebar/use-gateway-me", async () => {
  const actual = await vi.importActual<
    typeof import("#/components/features/shell/sidebar/use-gateway-me")
  >("#/components/features/shell/sidebar/use-gateway-me");
  return {
    ...actual,
    useGatewayMe: () => mockMe(),
    signOutFromGateway: () => mockSignOut(),
  };
});
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (translations as Record<string, Record<string, string>>)[key]?.en ?? key,
  }),
}));
vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({
    currentPath: "/",
    conversationId: null,
    isNavigating: false,
    navigate: vi.fn(),
  }),
}));

import { SidebarAccount } from "#/components/features/shell/sidebar/sidebar-account";

beforeEach(() => {
  mockMe.mockReset();
  mockSignOut.mockReset();
});

describe("SidebarAccount", () => {
  it("shows Log in / Sign up links for a guest", () => {
    mockMe.mockReturnValue({
      status: "guest",
      user: { name: "Misafir" },
      isGuest: true,
    });
    render(<SidebarAccount collapsed={false} />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(screen.queryByTestId("shell-account-tile")).toBeNull();
  });

  it("shows the CTA when the gateway is unavailable, too", () => {
    mockMe.mockReturnValue({
      status: "unavailable",
      user: null,
      isGuest: true,
    });
    render(<SidebarAccount collapsed={false} />);
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });

  it("renders the member tile with initial, name and plan, and opens the menu", () => {
    mockMe.mockReturnValue({
      status: "member",
      user: { name: "Sait Yasin", email: "s@corat.ai" },
      isGuest: false,
    });
    render(<SidebarAccount collapsed={false} />);
    const tile = screen.getByTestId("shell-account-tile");
    expect(tile).toHaveTextContent("S");
    expect(tile).toHaveTextContent("Sait Yasin");
    expect(tile).toHaveTextContent("Free plan");

    fireEvent.click(tile);
    expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings",
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Logout" }));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("collapsed: only the avatar, still opens the menu", () => {
    mockMe.mockReturnValue({
      status: "member",
      user: { name: "Ada" },
      isGuest: false,
    });
    render(<SidebarAccount collapsed />);
    const tile = screen.getByTestId("shell-account-tile");
    expect(tile).toHaveTextContent("A");
    expect(tile).not.toHaveTextContent("Free plan");
    fireEvent.click(tile);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("collapsed guest: a single Log in icon link", () => {
    mockMe.mockReturnValue({ status: "guest", user: null, isGuest: true });
    render(<SidebarAccount collapsed />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("closes the member menu on Escape", () => {
    mockMe.mockReturnValue({
      status: "member",
      user: { name: "Sait Yasin", email: "s@corat.ai" },
      isGuest: false,
    });
    render(<SidebarAccount collapsed={false} />);
    fireEvent.click(screen.getByTestId("shell-account-tile"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
