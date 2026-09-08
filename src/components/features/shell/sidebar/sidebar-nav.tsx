import React from "react";
import { useTranslation } from "react-i18next";
import { MessageSquare, Plus, SlidersHorizontal } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { NavigationLink } from "#/components/shared/navigation-link";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import { useNavigation } from "#/context/navigation-context";
import { CUSTOMIZE_PATH } from "#/hooks/use-pinned-home-route";
import {
  automationListPath,
  getInterfaceCopy,
  hasAutomationInterface,
} from "#/manifests/automation-interface";
import AutomationsIcon from "#/icons/automations.svg?react";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "../shell-tokens";

function isActive(currentPath: string, to: string, end: boolean) {
  if (end) return currentPath === to;
  return currentPath === to || currentPath.startsWith(`${to}/`);
}

function NavRow({
  to,
  label,
  icon,
  collapsed,
  end = false,
  testId,
  extraActivePaths = [],
  emphasis = false,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  collapsed: boolean;
  end?: boolean;
  testId: string;
  extraActivePaths?: string[];
  /** Yeni sohbet: ink metin + kiremit "+" dairesi. */
  emphasis?: boolean;
}) {
  const { currentPath } = useNavigation();
  const active =
    isActive(currentPath, to, end) ||
    extraActivePaths.some((p) => isActive(currentPath, p, false));
  const link = (
    <NavigationLink
      to={to}
      end={end}
      data-testid={testId}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        SHELL.navRow,
        collapsed && "justify-center px-0",
        active ? SHELL.navRowActive : SHELL.navRowIdle,
        emphasis && "text-content-2 font-medium",
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">
        {icon}
      </span>
      {!collapsed ? <span className="min-w-0 truncate">{label}</span> : null}
    </NavigationLink>
  );
  return collapsed ? (
    <StyledTooltip content={label} placement="right">
      {link}
    </StyledTooltip>
  ) : (
    link
  );
}

export function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation("openhands");
  return (
    <nav
      className={cn(
        "flex flex-col gap-0.5",
        collapsed ? "items-center px-1" : "px-2",
      )}
    >
      <NavRow
        to="/conversations"
        end
        testId="shell-nav-new-chat"
        label={t(I18nKey.SIDEBAR$NEW_CHAT)}
        collapsed={collapsed}
        emphasis
        icon={
          <span className="flex size-5 items-center justify-center rounded-full bg-[var(--oh-accent)] text-white">
            <Plus width={12} height={12} strokeWidth={2.5} />
          </span>
        }
      />
      <NavRow
        to="/conversations"
        testId="shell-nav-chats"
        label={t(I18nKey.SHELL$CHATS)}
        collapsed={collapsed}
        icon={<MessageSquare width={SHELL_ICON} height={SHELL_ICON} />}
      />
      {hasAutomationInterface() ? (
        <NavRow
          to={automationListPath()}
          testId="shell-nav-automations"
          label={getInterfaceCopy().sidebarLabel}
          collapsed={collapsed}
          icon={<AutomationsIcon width={SHELL_ICON} height={SHELL_ICON} />}
        />
      ) : null}
      <NavRow
        to={CUSTOMIZE_PATH}
        testId="shell-nav-customize"
        label={t(I18nKey.NAV$CUSTOMIZE)}
        collapsed={collapsed}
        extraActivePaths={["/skills", "/plugins", "/mcp"]}
        icon={<SlidersHorizontal width={SHELL_ICON} height={SHELL_ICON} />}
      />
    </nav>
  );
}
