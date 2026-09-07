import React from "react";
import { useTranslation } from "react-i18next";
import { LogIn, LogOut, Settings } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "../shell-tokens";
import { ShellMenu, ShellMenuItem } from "../menu";
import { firstName, signOutFromGateway, useGatewayMe } from "./use-gateway-me";

/**
 * Sidebar'ın en altı. Üye: avatar + ad + "Ücretsiz plan", tıklayınca
 * yukarı açılan menü (Ayarlar, Çıkış). Misafir (veya gateway yok): "Giriş
 * yap" / "Kaydol" — gateway'in kendi sayfaları, tam sayfa geçiş (<a>).
 */
export function SidebarAccount({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation("openhands");
  const me = useGatewayMe();
  const [open, setOpen] = React.useState(false);
  const tileRef = React.useRef<HTMLButtonElement>(null);

  if (me.status === "loading") {
    return <div className="h-12 shrink-0" aria-hidden />;
  }

  if (me.isGuest) {
    if (collapsed) {
      return (
        <a
          href="/login"
          aria-label={t(I18nKey.SHELL$SIGN_IN)}
          title={t(I18nKey.SHELL$SIGN_IN)}
          className={cn(SHELL.iconButton, "mx-auto mb-2 size-8")}
        >
          <LogIn width={SHELL_ICON} height={SHELL_ICON} />
        </a>
      );
    }
    return (
      <div
        data-testid="shell-guest-cta"
        className="flex flex-col gap-2 px-2 pb-2"
      >
        <a
          href="/login"
          className={cn(
            "flex h-9 items-center justify-center rounded-lg border border-[var(--oh-border)] text-sm text-content-2",
            "hover:bg-[var(--cool-grey-900)] transition-none",
          )}
        >
          {t(I18nKey.SHELL$SIGN_IN)}
        </a>
        <a
          href="/signup"
          className="flex h-9 items-center justify-center rounded-lg bg-[var(--oh-accent)] text-sm font-medium text-white hover:bg-[#B5502F] transition-none"
        >
          {t(I18nKey.SHELL$SIGN_UP)}
        </a>
      </div>
    );
  }

  const displayName = me.user?.name?.trim() || me.user?.email || "";
  const initial = (firstName(me.user) ?? "?").charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "relative shrink-0",
        collapsed ? "mx-auto mb-2" : "px-2 pb-2",
      )}
    >
      <button
        ref={tileRef}
        type="button"
        data-testid="shell-account-tile"
        aria-label={t(I18nKey.SHELL$ACCOUNT_MENU)}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg text-left transition-none",
          collapsed
            ? "size-8 justify-center"
            : "h-12 px-2 hover:bg-[var(--cool-grey-900)]",
          open && "bg-[var(--cool-grey-900)]",
        )}
      >
        <span className={SHELL.avatar}>{initial}</span>
        {!collapsed ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm leading-5 text-content-2">
              {displayName}
            </span>
            <span className="block truncate text-xs leading-4 text-[var(--oh-muted)]">
              {t(I18nKey.SHELL$FREE_PLAN)}
            </span>
          </span>
        ) : null}
      </button>
      <ShellMenu
        open={open}
        onClose={() => setOpen(false)}
        anchor="top-left"
        ignoreOutsideClickRef={tileRef}
        testId="shell-account-menu"
        className={cn(collapsed && "left-full bottom-0 ml-2 mb-0")}
      >
        <ShellMenuItem
          href="/settings"
          icon={<Settings />}
          label={t(I18nKey.SIDEBAR$SETTINGS)}
          onClick={() => setOpen(false)}
        />
        <ShellMenuItem
          icon={<LogOut />}
          label={t(I18nKey.ACCOUNT_SETTINGS$LOGOUT)}
          onClick={() => {
            setOpen(false);
            void signOutFromGateway();
          }}
        />
      </ShellMenu>
    </div>
  );
}
