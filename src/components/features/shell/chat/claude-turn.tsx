import React from "react";
import CoratLogo from "#/assets/branding/corat-logo.svg?react";
import { CopyToClipboardButton } from "#/components/shared/buttons/copy-to-clipboard-button";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import { MarkdownRenderer } from "#/components/features/markdown/markdown-renderer";
import { chatBubbleMarkdownComponents } from "#/components/features/chat/user-message-body";
import { cn } from "#/utils/utils";
import { SHELL } from "../shell-tokens";
import { firstName, useGatewayMe } from "../sidebar/use-gateway-me";

export interface ClaudeTurnProps {
  type: "user" | "agent";
  message: string;
  actions?: Array<{
    icon: React.ReactNode;
    onClick: () => void;
    tooltip?: string;
  }>;
  isFromPlanningAgent?: boolean;
}

/**
 * claude.ai sohbet turu. Kullanıcı: solda baş harf avatarı, krem balon
 * (tam genişlik). Asistan: solda Corat işareti, balonsuz serif prose.
 * Aksiyonlar (kopyala + verilenler) içeriğin ALTINDA, hover'da görünür —
 * eski kabuğun sağ üst köşe overlay'i değil.
 */
export function ClaudeTurn({
  type,
  message,
  actions,
  isFromPlanningAgent = false,
  children,
}: React.PropsWithChildren<ClaudeTurnProps>) {
  const me = useGatewayMe();
  const [hovering, setHovering] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const initial = (firstName(me.user) ?? "?").charAt(0).toUpperCase();
  const hasChildren = React.Children.count(children) > 0;

  return (
    <article
      data-testid={`${type}-message`}
      data-shell-turn={type}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={cn(
        "mt-6 flex w-full max-w-full gap-3 last:mb-4",
        isFromPlanningAgent && "rounded-2xl border border-[#597ff4] p-3",
      )}
    >
      {type === "user" ? (
        <span
          data-testid="shell-turn-avatar"
          className={cn(SHELL.avatar, "mt-0.5")}
        >
          {initial}
        </span>
      ) : (
        <span
          data-testid="shell-turn-mark"
          className="mt-1 flex size-7 shrink-0 items-center justify-center"
        >
          <CoratLogo width={26} height={14} aria-hidden />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          data-testid="shell-turn-body"
          className={cn(
            "min-w-0 [word-break:break-word]",
            type === "user"
              ? cn(SHELL.userBubble, "w-fit max-w-full")
              : "markdown-body text-content-2",
            hasChildren && "flex flex-col gap-2",
          )}
        >
          <MarkdownRenderer
            includeStandard
            includeHeadings
            allowHtml={type !== "user"}
            components={chatBubbleMarkdownComponents}
          >
            {message}
          </MarkdownRenderer>
          {children}
        </div>
        <div
          data-testid="shell-turn-actions"
          className={cn(
            "mt-1 flex h-7 items-center gap-1 transition-opacity duration-100",
            hovering ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <CopyToClipboardButton
            isHidden={false}
            isDisabled={copied}
            mode={copied ? "copied" : "copy"}
            onClick={async () => {
              await navigator.clipboard.writeText(message);
              setCopied(true);
            }}
          />
          {actions?.map((a, i) =>
            a.tooltip ? (
              <StyledTooltip key={i} content={a.tooltip} placement="top">
                <button
                  type="button"
                  aria-label={a.tooltip}
                  onClick={a.onClick}
                  className={SHELL.iconButton}
                >
                  {a.icon}
                </button>
              </StyledTooltip>
            ) : (
              <button
                key={i}
                type="button"
                aria-label={`Action ${i + 1}`}
                onClick={a.onClick}
                className={SHELL.iconButton}
              >
                {a.icon}
              </button>
            ),
          )}
        </div>
      </div>
    </article>
  );
}
