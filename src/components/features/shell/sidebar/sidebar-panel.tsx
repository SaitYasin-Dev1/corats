import React from "react";
import { useTranslation } from "react-i18next";
import { PanelLeft, X } from "lucide-react";
import CoratLogo from "#/assets/branding/corat-logo.svg?react";
import { NavigationLink } from "#/components/shared/navigation-link";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "../shell-tokens";
import { SidebarNav } from "./sidebar-nav";
import { SidebarRecents } from "./sidebar-recents";
import { SidebarAccount } from "./sidebar-account";

/**
 * Sidebar'ın içeriği — rail (collapsed), genişletilmiş, peek overlay ve
 * mobil drawer aynı bileşeni farklı `collapsed`/kapatma düğmeleriyle çizer.
 */
export function SidebarPanel({
  collapsed,
  onCollapse,
  onExpand,
  showCollapseToggle = true,
  showMobileClose = false,
  onCloseMobile,
}: {
  collapsed: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
  showCollapseToggle?: boolean;
  showMobileClose?: boolean;
  onCloseMobile?: () => void;
}) {
  const { t } = useTranslation("openhands");
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className={cn(
          "flex h-12 min-h-12 shrink-0 items-center",
          collapsed ? "justify-center" : "gap-2 px-3",
        )}
      >
        <NavigationLink
          to="/conversations"
          aria-label={t(I18nKey.BRANDING$OPENHANDS_LOGO)}
          className="flex items-center"
        >
          <CoratLogo
            width={collapsed ? 26 : 34}
            height={collapsed ? 14 : 19}
            className="shrink-0"
          />
        </NavigationLink>
        {!collapsed && showCollapseToggle ? (
          <button
            type="button"
            aria-label={t(I18nKey.SIDEBAR$COLLAPSE)}
            onClick={onCollapse}
            className={cn(SHELL.iconButton, "ml-auto hidden md:flex")}
          >
            <PanelLeft width={SHELL_ICON} height={SHELL_ICON} />
          </button>
        ) : null}
        {!collapsed && showMobileClose ? (
          <button
            type="button"
            aria-label={t(I18nKey.SIDEBAR$CLOSE_MENU)}
            onClick={onCloseMobile}
            className={cn(SHELL.iconButton, "ml-auto")}
          >
            <X width={SHELL_ICON} height={SHELL_ICON} />
          </button>
        ) : null}
      </div>
      {collapsed && showCollapseToggle ? (
        <button
          type="button"
          aria-label={t(I18nKey.SIDEBAR$EXPAND)}
          onClick={onExpand}
          className={cn(SHELL.iconButton, "mx-auto mb-1")}
        >
          <PanelLeft width={SHELL_ICON} height={SHELL_ICON} />
        </button>
      ) : null}

      <SidebarNav collapsed={collapsed} />
      {!collapsed ? (
        <div className="flex min-h-0 flex-1 flex-col px-2">
          <SidebarRecents />
        </div>
      ) : (
        <div className="flex-1" />
      )}
      <SidebarAccount collapsed={collapsed} />
    </div>
  );
}
