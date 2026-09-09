import React from "react";
import { useTranslation } from "react-i18next";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { NavigationLink } from "#/components/shared/navigation-link";
import { useNavigation } from "#/context/navigation-context";
import { usePaginatedConversations } from "#/hooks/query/use-paginated-conversations";
import { useUpdateConversation } from "#/hooks/mutation/use-update-conversation";
import { useDeleteConversation } from "#/hooks/mutation/use-delete-conversation";
import { ConfirmDeleteModal } from "#/components/features/conversation-panel/confirm-delete-modal";
import { hoverRevealActionClassName } from "#/utils/hover-reveal-classes";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "../shell-tokens";
import { ShellMenu, ShellMenuItem } from "../menu";

type Recent = Pick<AppConversation, "id" | "title" | "updated_at">;

function sortNewestFirst(list: Recent[]): Recent[] {
  return [...list].sort(
    (a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at),
  );
}

/** claude.ai "Recents": düz liste, hover'da … menüsü (Yeniden adlandır, Sil). */
export function SidebarRecents({ limit = 20 }: { limit?: number }) {
  const { t } = useTranslation("openhands");
  const { data, isLoading } = usePaginatedConversations(limit);
  const items = React.useMemo(
    () =>
      sortNewestFirst(data?.pages.flatMap((p) => p.items) ?? []).slice(
        0,
        limit,
      ),
    [data, limit],
  );
  // Distinguish "still loading" from "genuinely zero conversations": the
  // former must render a placeholder (the section would otherwise vanish on
  // mount and pop in once the query resolves), the latter renders nothing.
  if (!isLoading && items.length === 0) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={SHELL.sectionLabel}>{t(I18nKey.SHELL$RECENTS)}</div>
      {isLoading && items.length === 0 ? (
        <ul
          data-testid="shell-recents-loading"
          className="flex flex-col gap-0.5 px-0"
          aria-hidden
        >
          {[0, 1, 2].map((i) => (
            <li key={i} className={cn(SHELL.navRow, "px-2")}>
              <span className="h-4 w-full animate-pulse rounded bg-[var(--cool-grey-900)]" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
          {items.map((c) => (
            <RecentRow key={c.id} conversation={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function RecentRow({ conversation }: { conversation: Recent }) {
  const { t } = useTranslation("openhands");
  const { conversationId, navigate } = useNavigation();
  const { mutate: updateConversation } = useUpdateConversation();
  const { mutate: deleteConversation } = useDeleteConversation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const active = conversationId === conversation.id;
  const title = conversation.title?.trim() || conversation.id;

  React.useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commitRename = () => {
    const next = inputRef.current?.value.trim() ?? "";
    setEditing(false);
    if (next && next !== title) {
      updateConversation({ conversationId: conversation.id, newTitle: next });
    }
  };

  return (
    <li
      data-testid="shell-recent-row"
      data-active={active ? "true" : "false"}
      className={cn(
        "group relative",
        SHELL.navRow,
        "px-0 gap-0",
        active ? SHELL.navRowActive : SHELL.navRowIdle,
        menuOpen && "bg-[var(--cool-grey-900)]",
      )}
    >
      {editing ? (
        <input
          ref={inputRef}
          defaultValue={title}
          aria-label={t(I18nKey.SHELL$RENAME)}
          className="h-8 w-full rounded-lg bg-[var(--oh-surface-raised)] px-2 text-sm text-content-2 outline-none ring-1 ring-[var(--oh-accent)]"
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <>
          <NavigationLink
            to={`/conversations/${conversation.id}`}
            data-testid="shell-recent-link"
            title={title}
            className="flex h-8 min-w-0 flex-1 items-center truncate px-2 pr-8"
          >
            {title}
          </NavigationLink>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={t(I18nKey.SHELL$CHAT_OPTIONS)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2",
              "flex size-6 items-center justify-center rounded-md text-[var(--oh-muted)] hover:bg-[var(--cool-grey-800)] hover:text-content-2 transition-none",
              hoverRevealActionClassName(menuOpen),
            )}
          >
            <Ellipsis width={SHELL_ICON} height={SHELL_ICON} />
          </button>
          <ShellMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            anchor="bottom-right"
            ignoreOutsideClickRef={menuButtonRef}
          >
            <ShellMenuItem
              icon={<Pencil />}
              label={t(I18nKey.SHELL$RENAME)}
              onClick={() => {
                setMenuOpen(false);
                setEditing(true);
              }}
            />
            <ShellMenuItem
              icon={<Trash2 />}
              label={t(I18nKey.SHELL$DELETE_CHAT)}
              danger
              onClick={() => {
                setMenuOpen(false);
                setConfirmDelete(true);
              }}
            />
          </ShellMenu>
        </>
      )}
      {confirmDelete ? (
        <ConfirmDeleteModal
          conversationTitle={title}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            deleteConversation({ conversationId: conversation.id });
            if (active) navigate("/conversations");
          }}
        />
      ) : null}
    </li>
  );
}
