import { ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isHostedMode } from "#/api/agent-server-config";
import { I18nKey } from "#/i18n/declaration";
import { SHELL } from "#/components/features/shell/shell-tokens";
import { cn } from "#/utils/utils";

export interface ChatSendButtonProps {
  buttonClassName: string;
  handleSubmit: () => void;
  disabled: boolean;
}

export function ChatSendButton({
  buttonClassName,
  handleSubmit,
  disabled,
}: ChatSendButtonProps) {
  const { t } = useTranslation("openhands");
  // Hosted (claude kabuğu): kiremit dolgulu rounded-lg; local: eski daire.
  const claude = isHostedMode();
  return (
    <button
      type="button"
      className={cn(
        claude
          ? SHELL.sendButton
          : cn(
              "flex items-center justify-center rounded-full border border-[#3D3929] size-8",
              disabled
                ? "cursor-not-allowed border-[var(--oh-muted)]"
                : "cursor-pointer hover:bg-[#3D3929]/10",
            ),
        buttonClassName,
      )}
      data-name="arrow-up-circle-fill"
      data-testid="submit-button"
      aria-label={t(I18nKey.SHELL$SEND)}
      onClick={handleSubmit}
      disabled={disabled}
    >
      <ArrowUp
        className="w-4 h-4"
        color={claude ? "#ffffff" : disabled ? "var(--oh-muted)" : "#3D3929"}
      />
    </button>
  );
}
