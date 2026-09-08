import React from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { useSidebarStore } from "#/stores/sidebar-store";
import { useSidebarMobileNav } from "#/components/features/sidebar/sidebar-mobile-nav-context";
import { useNavigation } from "#/context/navigation-context";
import { cn } from "#/utils/utils";
import { SHELL } from "../shell-tokens";
import { SidebarPanel } from "./sidebar-panel";

const PEEK_DELAY_MS = 150;

/**
 * claude.ai sidebar: 18rem genişletilmiş / 3rem rail. Rail'e gelince peek
 * (genişletilmiş panel içerik üstüne overlay), ayrılınca kapanır; rail
 * toggle'ı kalıcı genişletir. <md'de off-canvas drawer (mobil nav context).
 */
export function ClaudeSidebar() {
  const { t } = useTranslation("openhands");
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);
  const { isOpen: mobileOpen, close: closeMobile } = useSidebarMobileNav();
  const { currentPath } = useNavigation();
  const [peek, setPeek] = React.useState(false);
  const peekTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPeekTimer = () => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = null;
  };
  const schedulePeek = (next: boolean) => {
    clearPeekTimer();
    peekTimer.current = setTimeout(() => setPeek(next), PEEK_DELAY_MS);
  };

  React.useEffect(() => {
    closeMobile();
    // Also cancel any in-flight peek timer: without this, a rail nav click
    // that fires just before the 150ms peek delay elapses would still open
    // peek over the page just navigated to (the stale timeout is unaffected
    // by this effect's own setPeek(false) below).
    clearPeekTimer();
    setPeek(false);
  }, [currentPath, closeMobile]);

  return (
    <>
      <aside
        data-testid="shell-sidebar"
        data-collapsed={collapsed ? "true" : "false"}
        aria-label={t(I18nKey.SIDEBAR$NAVIGATION_LABEL)}
        onMouseEnter={() => {
          if (collapsed) schedulePeek(true);
        }}
        onMouseLeave={() => {
          if (collapsed) schedulePeek(false);
        }}
        className={cn(
          "relative hidden h-full min-h-0 shrink-0 flex-col md:flex",
          SHELL.sidebarSurface,
          "transition-[width,min-width] duration-200 motion-reduce:transition-none",
          collapsed ? SHELL.sidebarCollapsedWidth : SHELL.sidebarExpandedWidth,
        )}
      >
        <SidebarPanel
          collapsed={collapsed}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => {
            clearPeekTimer();
            setPeek(false);
            setCollapsed(false);
          }}
        />
        {collapsed && peek ? (
          <div
            data-testid="shell-sidebar-peek"
            className={cn(
              "absolute inset-y-2 left-0 z-40 flex flex-col rounded-r-2xl",
              SHELL.sidebarExpandedWidth,
              SHELL.sidebarSurface,
              SHELL.sidebarPeekShadow,
            )}
          >
            <SidebarPanel collapsed={false} showCollapseToggle={false} />
          </div>
        ) : null}
      </aside>

      {mobileOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={closeMobile}
            aria-hidden
          />
          <aside
            data-testid="shell-sidebar-mobile"
            aria-label={t(I18nKey.SIDEBAR$NAVIGATION_LABEL)}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col md:hidden",
              SHELL.sidebarSurface,
              "shadow-[0_8px_32px_rgba(31,29,23,0.18)]",
            )}
          >
            <SidebarPanel
              collapsed={false}
              showCollapseToggle={false}
              showMobileClose
              onCloseMobile={closeMobile}
            />
          </aside>
        </>
      ) : null}
    </>
  );
}
