/* eslint-disable i18next/no-literal-string -- test harness intentionally uses literal labels */
import { render, screen, fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import translations from "#/i18n/translation.json";

const mockNavigate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
let currentConversationId: string | null = null;
let items: Array<{ id: string; title: string | null; updated_at: string }> = [];

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const raw =
        (translations as Record<string, Record<string, string>>)[key]?.en ??
        key;
      return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => opts?.[k] ?? "");
    },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({
    currentPath: "/",
    conversationId: currentConversationId,
    isNavigating: false,
    navigate: mockNavigate,
  }),
}));
vi.mock("#/hooks/query/use-paginated-conversations", () => ({
  usePaginatedConversations: () => ({
    data: { pages: [{ items, next_page_id: null }] },
    isLoading: false,
  }),
}));
vi.mock("#/hooks/mutation/use-update-conversation", () => ({
  useUpdateConversation: () => ({ mutate: mockUpdate }),
}));
vi.mock("#/hooks/mutation/use-delete-conversation", () => ({
  useDeleteConversation: () => ({ mutate: mockDelete }),
}));
vi.mock(
  "#/components/features/conversation-panel/confirm-delete-modal",
  () => ({
    ConfirmDeleteModal: ({
      onConfirm,
      onCancel,
    }: {
      onConfirm: () => void;
      onCancel: () => void;
    }) => (
      <div data-testid="confirm-delete">
        <button type="button" onClick={onConfirm}>
          confirm
        </button>
        <button type="button" onClick={onCancel}>
          cancel
        </button>
      </div>
    ),
  }),
);

import { SidebarRecents } from "#/components/features/shell/sidebar/sidebar-recents";

beforeEach(() => {
  mockNavigate.mockReset();
  mockUpdate.mockReset();
  mockDelete.mockReset();
  currentConversationId = null;
  items = [
    { id: "c-old", title: "Eski sohbet", updated_at: "2026-09-01T10:00:00Z" },
    { id: "c-new", title: "Yeni sohbet", updated_at: "2026-09-07T10:00:00Z" },
    { id: "c-untitled", title: null, updated_at: "2026-09-05T10:00:00Z" },
  ];
});

describe("SidebarRecents", () => {
  it("lists conversations newest first under a 'Recents' label, linking to each", () => {
    render(<SidebarRecents />);
    expect(screen.getByText("Recents")).toBeInTheDocument();
    const links = screen.getAllByTestId("shell-recent-link");
    expect(links.map((l) => l.textContent)).toEqual([
      "Yeni sohbet",
      "c-untitled",
      "Eski sohbet",
    ]);
    expect(links[0]).toHaveAttribute("href", "/conversations/c-new");
  });

  it("marks the active conversation", () => {
    currentConversationId = "c-old";
    render(<SidebarRecents />);
    const active = screen
      .getAllByTestId("shell-recent-row")
      .find((r) => r.textContent?.includes("Eski sohbet"));
    expect(active).toHaveAttribute("data-active", "true");
  });

  it("renames inline from the row menu", () => {
    render(<SidebarRecents />);
    const row = screen.getAllByTestId("shell-recent-row")[0];
    fireEvent.click(within(row).getByLabelText("Chat options"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    const input = within(row).getByRole("textbox");
    fireEvent.change(input, { target: { value: "Yepyeni" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockUpdate).toHaveBeenCalledWith({
      conversationId: "c-new",
      newTitle: "Yepyeni",
    });
  });

  it("deletes after confirmation and navigates home when the active chat is deleted", () => {
    currentConversationId = "c-new";
    render(<SidebarRecents />);
    const row = screen.getAllByTestId("shell-recent-row")[0];
    fireEvent.click(within(row).getByLabelText("Chat options"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(
      within(screen.getByTestId("confirm-delete")).getByText("confirm"),
    );
    expect(mockDelete).toHaveBeenCalledWith({ conversationId: "c-new" });
    expect(mockNavigate).toHaveBeenCalledWith("/conversations");
  });

  it("renders nothing when there are no conversations", () => {
    items = [];
    const { container } = render(<SidebarRecents />);
    expect(container).toBeEmptyDOMElement();
  });
});
