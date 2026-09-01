import React from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import CoratLogo from "#/assets/branding/corat-logo.svg?react";
import { clearCachedAgentServerInfo } from "#/api/agent-server-compatibility";
import { QUERY_KEYS } from "#/hooks/query/query-keys";
import { I18nKey } from "#/i18n/declaration";

/**
 * Hosted (multi-tenant SaaS) replacement for the Manage Backends recovery
 * screen. A hosted tenant has no backend to manage: when their sandbox is
 * unreachable it's because the gateway is (re)provisioning it, which every
 * retried request accelerates — ensureRunning heals missing/stopped
 * containers on contact. So instead of stranding the user on backend
 * plumbing ("Local · Disconnected · Add Backend"), show the brand, say the
 * one honest thing, and quietly re-probe until the workspace answers.
 */
const RETRY_INTERVAL_MS = 5000;

export function WorkspacePreparingScreen() {
  const { t } = useTranslation("openhands");
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      // Same recovery mechanics as MissingAgentServerScreen's onClose: the
      // failed /server_info bootstrap never re-fires on its own.
      clearCachedAgentServerInfo();
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.WEB_CLIENT_CONFIG,
      });
    }, RETRY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [queryClient]);

  return (
    <main
      data-testid="hosted-workspace-preparing"
      className="flex min-h-screen items-center justify-center bg-base px-6"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-7">
          <div
            aria-hidden
            className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(101,106,246,0.30),transparent_72%)] animate-pulse motion-reduce:animate-none"
          />
          <CoratLogo width={132} height={73} className="relative" aria-hidden />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-white">
          {t(I18nKey.HOSTED$PREPARING_TITLE)}
        </h1>
        <p className="mt-1.5 max-w-sm text-sm text-[var(--oh-muted)]">
          {t(I18nKey.HOSTED$PREPARING_HINT)}
        </p>
      </div>
    </main>
  );
}
