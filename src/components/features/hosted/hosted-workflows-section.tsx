import React from "react";
import { useTranslation } from "react-i18next";
import { Play, Plus, RefreshCw } from "lucide-react";
import { isHostedMode } from "#/api/agent-server-config";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

/**
 * Hosted-mode "Workflows" block on the Automate page: the tenant's
 * ActivePieces flows, served by the gateway's session-authed
 * `/api/workflows` endpoints (list + create + trigger, all isolated to the
 * caller's organization by the control plane's flow-ownership table).
 *
 * Deliberately plain fetch + local state, like HostedProfileTile: these are
 * gateway endpoints on the serving origin, not agent-server APIs, and must
 * not run through any backend client or its caches.
 */

type WorkflowRun = {
  id: string;
  status: string;
  startTime: string | null;
  finishTime: string | null;
};

type Workflow = {
  id: string;
  displayName: string;
  status: string;
  latestRun: WorkflowRun | null;
  /** False for piece triggers (Telegram, Slack, …): they run on their real
   * event, so the panel's synthetic manual run would only ever fail. */
  manuallyTriggerable?: boolean;
};

const RUN_STATUS_CLASS: Record<string, string> = {
  SUCCEEDED: "text-emerald-400",
  FAILED: "text-red-400",
  RUNNING: "text-sky-400",
  PAUSED: "text-amber-300",
};

function formatRunTime(run: WorkflowRun): string {
  const stamp = run.finishTime ?? run.startTime;
  if (!stamp) return "";
  try {
    return new Date(stamp).toLocaleString();
  } catch {
    return stamp;
  }
}

export function HostedWorkflowsSection() {
  const { t } = useTranslation("openhands");
  const [workflows, setWorkflows] = React.useState<Workflow[] | null>(null);
  const [error, setError] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      // eslint-disable-next-line local/no-direct-agent-server-fetch -- gateway (control-plane) endpoint on the serving origin; see the component docblock.
      const res = await fetch("/api/workflows", { credentials: "same-origin" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { workflows: Workflow[] };
      setWorkflows(data.workflows);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    const displayName = newName.trim();
    if (!displayName) return;
    setCreating(true);
    try {
      // eslint-disable-next-line local/no-direct-agent-server-fetch -- gateway endpoint, same as above.
      const res = await fetch("/api/workflows", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      if (res.ok) {
        setNewName("");
        setShowCreate(false);
        await load();
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setCreating(false);
    }
  };

  const handleTrigger = async (flowId: string) => {
    setBusyId(flowId);
    try {
      // eslint-disable-next-line local/no-direct-agent-server-fetch -- gateway endpoint, same as above.
      await fetch(`/api/workflows/${encodeURIComponent(flowId)}/trigger`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "" }),
      });
      await load();
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  };

  if (!isHostedMode()) return null;

  return (
    <section
      data-testid="hosted-workflows-section"
      className="mt-6 rounded-xl border border-[var(--oh-border)] bg-base-secondary p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-content">
            {t(I18nKey.WORKFLOWS$TITLE)}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {t(I18nKey.WORKFLOWS$SUBTITLE)}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            data-testid="hosted-workflows-refresh"
            onClick={() => void load()}
            aria-label={t(I18nKey.WORKFLOWS$REFRESH)}
            title={t(I18nKey.WORKFLOWS$REFRESH)}
            className="flex size-8 items-center justify-center rounded-md text-[var(--oh-muted)] hover:bg-[var(--oh-surface-raised)] hover:text-white"
          >
            <RefreshCw className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            data-testid="hosted-workflows-new"
            onClick={() => setShowCreate((v) => !v)}
            className="flex h-8 items-center gap-1.5 rounded-md border border-[var(--oh-border)] px-3 text-sm font-medium text-content hover:bg-[var(--oh-surface-raised)]"
          >
            <Plus className="size-4" aria-hidden />
            {t(I18nKey.WORKFLOWS$NEW)}
          </button>
        </div>
      </div>

      {showCreate ? (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void handleCreate();
          }}
        >
          <input
            data-testid="hosted-workflows-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t(I18nKey.WORKFLOWS$NAME_PLACEHOLDER)}
            maxLength={120}
            className="h-9 min-w-0 flex-1 rounded-md border border-[var(--oh-border)] bg-base px-3 text-sm text-content placeholder:text-[var(--oh-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8055f6]"
          />
          <button
            type="submit"
            data-testid="hosted-workflows-create"
            disabled={creating || !newName.trim()}
            className={cn(
              "h-9 rounded-md px-3 text-sm font-semibold text-white",
              "bg-gradient-to-r from-[#8055f6] via-[#4e7df7] to-[#2ccff0]",
              (creating || !newName.trim()) && "opacity-60",
            )}
          >
            {t(I18nKey.WORKFLOWS$CREATE)}
          </button>
        </form>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-400">
          {t(I18nKey.WORKFLOWS$ERROR)}
        </p>
      ) : null}

      {workflows?.length === 0 && !error ? (
        <p className="mt-3 text-sm text-muted">{t(I18nKey.WORKFLOWS$EMPTY)}</p>
      ) : null}

      {workflows && workflows.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {workflows.map((wf) => (
            <li
              key={wf.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--oh-border)] bg-base px-3 py-2.5"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-content">
                  {wf.displayName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {wf.latestRun ? (
                    <>
                      {t(I18nKey.WORKFLOWS$LAST_RUN)}{" "}
                      <span
                        className={cn(
                          "font-medium",
                          RUN_STATUS_CLASS[wf.latestRun.status] ?? "text-muted",
                        )}
                      >
                        {wf.latestRun.status}
                      </span>{" "}
                      · {formatRunTime(wf.latestRun)}
                    </>
                  ) : (
                    t(I18nKey.WORKFLOWS$NO_RUNS)
                  )}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                  wf.status === "ENABLED"
                    ? "border-emerald-500/40 text-emerald-400"
                    : "border-[var(--oh-border)] text-muted",
                )}
              >
                {wf.status}
              </span>
              <button
                type="button"
                data-testid={`hosted-workflow-run-${wf.id}`}
                onClick={() => void handleTrigger(wf.id)}
                disabled={busyId === wf.id || wf.manuallyTriggerable === false}
                aria-label={
                  wf.manuallyTriggerable === false
                    ? t(I18nKey.WORKFLOWS$EVENT_TRIGGERED)
                    : t(I18nKey.WORKFLOWS$RUN)
                }
                title={
                  wf.manuallyTriggerable === false
                    ? t(I18nKey.WORKFLOWS$EVENT_TRIGGERED)
                    : t(I18nKey.WORKFLOWS$RUN)
                }
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md",
                  "text-[var(--oh-muted)] hover:bg-[var(--oh-surface-raised)] hover:text-white",
                  busyId === wf.id && "opacity-50",
                  wf.manuallyTriggerable === false &&
                    "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-[var(--oh-muted)]",
                )}
              >
                <Play className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
