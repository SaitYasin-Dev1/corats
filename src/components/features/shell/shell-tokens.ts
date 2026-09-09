import { cn } from "#/utils/utils";

/**
 * claude.ai shell ölçüleri — TEK KAYNAK (spec §4.2). Bileşenler buradan
 * okur; sapma bildirilirse burası güncellenir.
 */
export const SHELL_ICON = 16;

export const SHELL = {
  /** Genişletilmiş sidebar: 18rem. */
  sidebarExpandedWidth: "w-72 min-w-72",
  /** Daralmış rail: 3rem. */
  sidebarCollapsedWidth: "w-12 min-w-12",
  sidebarSurface: "bg-[var(--cool-grey-925)]",
  sidebarPeekShadow: "shadow-[0_4px_24px_rgba(31,29,23,0.08)]",

  /** Nav / son sohbet satırı: h-8, px-2, gap-2, rounded-lg, text-sm. */
  navRow: cn(
    "flex h-8 min-h-8 w-full min-w-0 items-center gap-2 rounded-lg px-2",
    "text-sm leading-5 transition-none motion-reduce:transition-none",
  ),
  navRowIdle:
    "text-[var(--cool-grey-200)] hover:bg-[var(--cool-grey-900)] hover:text-content-2",
  navRowActive: "bg-[var(--cool-grey-800)] text-content-2",
  sectionLabel: "mt-5 mb-1 px-2 text-xs leading-4 text-[var(--cool-grey-500)]",

  /** İçerik kolonu: 48rem. */
  column: "mx-auto w-full max-w-[48rem] px-4",

  greeting: cn(
    "font-serif-shell text-[2rem] leading-[1.2] font-normal text-content-2",
    "flex items-center justify-center gap-3 text-center",
  ),

  composerCard: cn(
    "rounded-2xl border border-[var(--oh-border)] bg-[var(--oh-surface-raised)]",
    "shadow-[0_1px_2px_rgba(0,0,0,0.16),0_0_0_1px_rgba(0,0,0,0.08)]",
    "focus-within:border-[var(--cool-grey-600)]",
  ),
  composerPadding: "px-4 pt-3.5 pb-3",
  /** Kiremit yuvarlak-köşeli gönder düğmesi (32px). */
  sendButton: cn(
    "flex size-8 items-center justify-center rounded-lg border-0",
    "bg-[var(--oh-accent)] text-white hover:bg-[#B5502F]",
    "disabled:opacity-40 disabled:hover:bg-[var(--oh-accent)] disabled:cursor-not-allowed",
  ),
  /** Sol alttaki "+" (32px, kenarlıklı). */
  addButton: cn(
    "flex size-8 items-center justify-center rounded-lg",
    "border border-[var(--oh-border)] text-[var(--oh-muted)]",
    "hover:bg-[var(--cool-grey-900)] hover:text-content-2",
  ),

  /** Kullanıcı balonu: krem, rounded-2xl, px-4 py-2.5, 1rem/1.5. */
  userBubble:
    "rounded-2xl bg-[var(--cool-grey-900)] px-4 py-2.5 text-[1rem] leading-6 text-content-2",
  /** 28px baş harf / marka avatarı. */
  avatar: cn(
    "flex size-7 shrink-0 items-center justify-center rounded-full",
    "bg-[var(--cool-grey-800)] text-xs font-semibold text-content-2",
  ),

  /** Dropdown / popover. */
  menu: cn(
    "z-50 min-w-[12rem] rounded-xl border border-[var(--oh-border)] bg-[var(--oh-surface-deep)] p-1",
    "shadow-[0_8px_24px_rgba(0,0,0,0.32)]",
  ),
  menuItem: cn(
    "flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-left text-sm",
    "text-content-2 hover:bg-[var(--cool-grey-900)] transition-none",
  ),
  menuItemDanger: "text-[#B42318] hover:bg-[rgba(180,35,24,0.06)]",

  /** 28px ikon düğmesi (muted → ink). */
  iconButton: cn(
    "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md",
    "text-[var(--oh-muted)] hover:bg-[var(--cool-grey-900)] hover:text-content-2 transition-none",
  ),

  topbar: "flex h-12 min-h-12 shrink-0 items-center gap-2 px-3",
  panelSurface:
    "bg-[var(--oh-surface)] border-l border-[var(--oh-border-subtle)]",
} as const;
