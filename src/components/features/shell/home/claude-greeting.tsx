import { useTranslation } from "react-i18next";
import CoratLogo from "#/assets/branding/corat-logo.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { SHELL } from "../shell-tokens";
import { firstName, useGatewayMe } from "../sidebar/use-gateway-me";

export function greetingKeyForHour(hour: number): I18nKey {
  if (hour < 12) return I18nKey.SHELL$GREETING_MORNING;
  if (hour < 18) return I18nKey.SHELL$GREETING_AFTERNOON;
  return I18nKey.SHELL$GREETING_EVENING;
}

/** claude.ai ana ekran başlığı: Source Serif 4, 2rem, solunda marka işareti. */
export function ClaudeGreeting({
  now = () => new Date(),
}: {
  now?: () => Date;
}) {
  const { t } = useTranslation("openhands");
  const me = useGatewayMe();
  const name = me.status === "member" ? firstName(me.user) : null;
  const text = name
    ? t(greetingKeyForHour(now().getHours()), { name })
    : t(I18nKey.SHELL$GUEST_GREETING);
  return (
    <h1 data-testid="shell-greeting" className={SHELL.greeting}>
      <CoratLogo width={40} height={22} className="shrink-0" aria-hidden />
      <span>{text}</span>
    </h1>
  );
}
