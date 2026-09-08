import React from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "../shell-tokens";
import { useGatewayMe } from "../sidebar/use-gateway-me";

export const GUEST_HINT_DISMISSED_KEY = "corat:guest-hint-dismissed";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(GUEST_HINT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Composer üstü tek satır: "Misafir olarak deniyorsun · Kaydol, sohbetlerin saklansın". */
export function GuestHint() {
  const { t } = useTranslation("openhands");
  const me = useGatewayMe();
  const [dismissed, setDismissed] = React.useState(readDismissed);

  if (dismissed || me.status === "loading" || !me.isGuest) return null;

  return (
    <div
      data-testid="shell-guest-hint"
      className={cn(
        "mx-auto flex h-9 w-fit max-w-full items-center gap-2 rounded-full border border-[var(--oh-border)]",
        "bg-[var(--cool-grey-925)] pl-4 pr-1 text-sm text-[var(--cool-grey-200)]",
      )}
    >
      <span className="truncate">{t(I18nKey.SHELL$GUEST_HINT)}</span>
      <span aria-hidden className="text-[var(--cool-grey-500)]">
        ·
      </span>
      <a
        href="/signup"
        className="shrink-0 text-[var(--oh-accent)] hover:underline"
      >
        {t(I18nKey.SHELL$GUEST_HINT_CTA)}
      </a>
      <button
        type="button"
        aria-label={t(I18nKey.SHELL$DISMISS)}
        onClick={() => {
          try {
            localStorage.setItem(GUEST_HINT_DISMISSED_KEY, "1");
          } catch {
            /* localStorage yok; sadece bu oturumda gizle */
          }
          setDismissed(true);
        }}
        className={cn(SHELL.iconButton, "size-7 rounded-full")}
      >
        <X width={SHELL_ICON} height={SHELL_ICON} />
      </button>
    </div>
  );
}
