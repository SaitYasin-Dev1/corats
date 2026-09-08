import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import CoratLogo from "#/assets/branding/corat-logo.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { useSidebarMobileNav } from "#/components/features/sidebar/sidebar-mobile-nav-context";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "./shell-tokens";

/** <md: hamburger + logo. Sohbet rotasında chat header kendi toggle'ını taşır. */
export function ShellMobileTopBar() {
  const { t } = useTranslation("openhands");
  const { open } = useSidebarMobileNav();
  return (
    <div className={cn(SHELL.topbar, "md:hidden")}>
      <button
        type="button"
        aria-label={t(I18nKey.SIDEBAR$EXPAND)}
        onClick={open}
        className={SHELL.iconButton}
      >
        <Menu width={SHELL_ICON} height={SHELL_ICON} />
      </button>
      <CoratLogo width={34} height={19} />
    </div>
  );
}
