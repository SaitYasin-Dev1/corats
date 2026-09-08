import { useTranslation } from "react-i18next";
import { Share } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { useConversationId } from "#/hooks/use-conversation-id";
import { useConversationNameContextMenu } from "#/hooks/use-conversation-name-context-menu";
import { cn } from "#/utils/utils";
import { SHELL_ICON } from "../shell-tokens";

/** Üst çubuk "Paylaş": mevcut paylaşım linkini kopyalar (context menü mantığı). */
export function ShareButton() {
  const { t } = useTranslation("openhands");
  const { conversationId } = useConversationId();
  const { handleCopyShareLink, shareUrl } = useConversationNameContextMenu({
    conversationId,
  });
  return (
    <button
      type="button"
      data-testid="shell-share-button"
      onClick={handleCopyShareLink}
      disabled={!shareUrl}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-lg border border-[var(--oh-border)] px-3 text-sm text-content-2",
        "hover:bg-[var(--cool-grey-900)] transition-none disabled:opacity-50 disabled:hover:bg-transparent",
      )}
    >
      <Share width={SHELL_ICON} height={SHELL_ICON} />
      {t(I18nKey.SHELL$SHARE)}
    </button>
  );
}
