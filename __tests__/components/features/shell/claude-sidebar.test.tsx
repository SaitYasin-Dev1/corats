import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import translations from "#/i18n/translation.json";
import { useSidebarStore } from "#/stores/sidebar-store";
import { SidebarMobileNavProvider } from "#/components/features/sidebar/sidebar-mobile-nav-context";

let currentPath = "/conversations";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      (translations as Record<string, Record<string, string>>)[key]?.en ?? key,
  }),
}));
vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({
    currentPath,
    conversationId: null,
    isNavigating: false,
    navigate: vi.fn(),
  }),
}));
vi.mock("#/components/features/shell/sidebar/use-gateway-me", () => ({
  useGatewayMe: () => ({
    status: "member",
    user: { name: "Sait" },
    isGuest: false,
  }),
  signOutFromGateway: vi.fn(),
  firstName: () => "Sait",
}));
vi.mock("#/hooks/query/use-paginated-conversations", () => ({
  usePaginatedConversations: () => ({
    data: { pages: [{ items: [], next_page_id: null }] },
    isLoading: false,
  }),
}));
vi.mock("#/manifests/automation-interface", () => ({
  hasAutomationInterface: () => true,
  automationListPath: () => "/automations",
  getInterfaceCopy: () => ({ sidebarLabel: "Automations" }),
}));
vi.mock("#/components/shared/buttons/styled-tooltip", () => ({
  StyledTooltip: ({ children }: { children: React.ReactNode }) => children,
}));

import { ClaudeSidebar } from "#/components/features/shell/sidebar/claude-sidebar";

function renderSidebar() {
  return render(
    <SidebarMobileNavProvider>
      <ClaudeSidebar />
    </SidebarMobileNavProvider>,
  );
}

beforeEach(() => {
  useSidebarStore.setState({ collapsed: false });
  currentPath = "/conversations";
});

describe("ClaudeSidebar", () => {
  it("expanded: shows New chat, Chats, Automations, Customize in order", () => {
    renderSidebar();
    const aside = screen.getByTestId("shell-sidebar");
    const labels = Array.from(
      aside.querySelectorAll("[data-testid^='shell-nav-']"),
    ).map((n) => n.textContent);
    expect(labels).toEqual(["New Chat", "Chats", "Automations", "Customize"]);
    expect(screen.getByTestId("shell-nav-new-chat")).toHaveAttribute(
      "href",
      "/conversations",
    );
    expect(screen.getByTestId("shell-nav-customize")).toHaveAttribute(
      "href",
      "/customize",
    );
    expect(aside.className).toContain("w-72");
  });

  it("collapses to a 3rem rail and expands again from the toggle", () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    const aside = screen.getByTestId("shell-sidebar");
    expect(aside.className).toContain("w-12");
    expect(useSidebarStore.getState().collapsed).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it("collapsed: hovering the rail peeks the expanded panel, leaving closes it", () => {
    vi.useFakeTimers();
    useSidebarStore.setState({ collapsed: true });
    renderSidebar();
    const aside = screen.getByTestId("shell-sidebar");
    fireEvent.mouseEnter(aside);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByTestId("shell-sidebar-peek")).toBeInTheDocument();
    fireEvent.mouseLeave(aside);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByTestId("shell-sidebar-peek")).toBeNull();
    vi.useRealTimers();
  });

  it("marks the current route active", () => {
    currentPath = "/customize";
    renderSidebar();
    expect(screen.getByTestId("shell-nav-customize")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByTestId("shell-nav-new-chat")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Customize active via aria-current while on one of its sub-routes", () => {
    currentPath = "/skills";
    renderSidebar();
    expect(screen.getByTestId("shell-nav-customize")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("cancels a pending peek timer on route change so it cannot reopen after navigation", () => {
    vi.useFakeTimers();
    useSidebarStore.setState({ collapsed: true });
    const { rerender } = renderSidebar();
    const aside = screen.getByTestId("shell-sidebar");
    fireEvent.mouseEnter(aside);
    // Navigate (e.g. clicking a rail nav icon) before the 150ms peek delay
    // elapses; the stale timer must not reopen peek after the route change.
    currentPath = "/customize";
    rerender(
      <SidebarMobileNavProvider>
        <ClaudeSidebar />
      </SidebarMobileNavProvider>,
    );
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByTestId("shell-sidebar-peek")).toBeNull();
    vi.useRealTimers();
  });
});
