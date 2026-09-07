import React from "react";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { NavigationLink } from "#/components/shared/navigation-link";
import { cn } from "#/utils/utils";
import { SHELL } from "./shell-tokens";

type Anchor = "bottom-left" | "top-left" | "bottom-right";

const ANCHOR_CLASS: Record<Anchor, string> = {
  "bottom-left": "top-full left-0 mt-1",
  "top-left": "bottom-full left-0 mb-1",
  "bottom-right": "top-full right-0 mt-1",
};

/**
 * claude.ai dropdown/popover: beyaz zemin, rounded-xl, ince gölge, 32px
 * satırlar. Konumu ebeveynin `relative` konteynerine göre `absolute`.
 * Açılış: 120ms fade + 2px yukarı kayma (motion-reduce'ta anlık).
 */
export function ShellMenu({
  open,
  onClose,
  anchor = "bottom-left",
  className,
  children,
  testId,
  ignoreOutsideClickRef,
}: {
  open: boolean;
  onClose: () => void;
  anchor?: Anchor;
  className?: string;
  children: React.ReactNode;
  testId?: string;
  ignoreOutsideClickRef?: React.RefObject<HTMLElement | null>;
}) {
  const ref = useClickOutsideElement<HTMLUListElement>(
    onClose,
    ignoreOutsideClickRef,
  );

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <ul
      ref={ref}
      role="menu"
      data-testid={testId}
      className={cn(
        "absolute",
        ANCHOR_CLASS[anchor],
        SHELL.menu,
        "animate-[shell-menu-in_120ms_ease-out] motion-reduce:animate-none",
        className,
      )}
    >
      {children}
    </ul>
  );
}

export function ShellMenuItem({
  icon,
  label,
  onClick,
  href,
  danger = false,
  testId,
}: {
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
  /** Verilirse satır bir NavigationLink olur (SPA içi rota). */
  href?: string;
  danger?: boolean;
  testId?: string;
}) {
  const className = cn(SHELL.menuItem, danger && SHELL.menuItemDanger);
  const body = (
    <>
      {icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
    </>
  );
  return (
    <li role="none">
      {href ? (
        <NavigationLink
          to={href}
          role="menuitem"
          data-testid={testId}
          className={className}
          onClick={onClick}
        >
          {body}
        </NavigationLink>
      ) : (
        <button
          type="button"
          role="menuitem"
          data-testid={testId}
          className={className}
          onClick={onClick}
        >
          {body}
        </button>
      )}
    </li>
  );
}
