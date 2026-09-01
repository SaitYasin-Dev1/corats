import React from "react";
import { useTranslation } from "react-i18next";
import { LogOut, UserRound } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

/**
 * Sidebar profile area for hosted (multi-tenant SaaS) mode — replaces the
 * BackendSelector, which is meaningless there: the tenant gateway
 * (corat-control-plane) picks the one-and-only backend from the user's
 * session, so users must never see backend plumbing at all.
 *
 * Identity comes from the gateway itself: the SPA is served from the
 * gateway's origin, so a same-origin `fetch("/api/me")` (a control-plane
 * route, matched before the catch-all sandbox proxy) carries the
 * better-auth session cookie and returns `{ user: { name, email } }`.
 * Sign-out POSTs the gateway's better-auth endpoint and sends the browser
 * to /login — the gateway's own unauthenticated landing page.
 *
 * Deliberately plain `fetch` + local state (not react-query): this endpoint
 * belongs to the gateway, not to any backend in the registry, and must not
 * be retried/invalidated alongside backend-scoped queries.
 */

type GatewayUser = { name?: string; email?: string };

export function HostedProfileTile({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  const { t } = useTranslation("openhands");
  const [user, setUser] = React.useState<GatewayUser | null>(null);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line local/no-direct-agent-server-fetch -- gateway (control-plane) endpoint on the serving origin, not an agent-server API; must NOT go through any backend client.
    fetch("/api/me", { credentials: "same-origin", signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: GatewayUser } | null) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {
        // Not fatal — the tile just renders without a name (e.g. when the
        // container is opened directly, without the gateway in front).
      });
    return () => controller.abort();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      // eslint-disable-next-line local/no-direct-agent-server-fetch -- gateway better-auth endpoint, same reasoning as /api/me above.
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
    } catch {
      // Even if the request fails, still navigate — /login re-checks the
      // session server-side and is always a safe place to land.
    }
    window.location.href = "/login";
  };

  const displayName = user?.name?.trim() || user?.email || "Hesabım";
  const initial = (user?.name?.trim() || user?.email || "?")
    .charAt(0)
    .toUpperCase();

  if (collapsed) {
    return (
      <div
        data-testid="hosted-profile-tile-collapsed"
        title={displayName}
        className={cn(
          "flex size-[34px] items-center justify-center rounded-full",
          "border border-[var(--oh-border)] bg-base-secondary text-sm font-semibold text-white",
          className,
        )}
      >
        {user ? initial : <UserRound width={16} height={16} />}
      </div>
    );
  }

  return (
    <div
      data-testid="hosted-profile-tile"
      className={cn(
        "flex w-full items-center gap-3 rounded-md border border-[var(--oh-border)] bg-base-secondary px-3 py-2",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--oh-surface-raised)] text-sm font-semibold text-white">
        {user ? initial : <UserRound width={16} height={16} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-5 text-white">
          {displayName}
        </span>
        {user?.email && user.email !== displayName ? (
          <span className="block truncate text-xs leading-4 text-[var(--oh-muted)]">
            {user.email}
          </span>
        ) : null}
      </span>
      <button
        type="button"
        data-testid="hosted-profile-sign-out"
        onClick={handleSignOut}
        disabled={signingOut}
        aria-label={t(I18nKey.ACCOUNT_SETTINGS$LOGOUT)}
        title={t(I18nKey.ACCOUNT_SETTINGS$LOGOUT)}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md",
          "text-[var(--oh-muted)] hover:bg-[var(--oh-surface-raised)] hover:text-white",
          signingOut && "opacity-60",
        )}
      >
        <LogOut width={15} height={15} />
      </button>
    </div>
  );
}
