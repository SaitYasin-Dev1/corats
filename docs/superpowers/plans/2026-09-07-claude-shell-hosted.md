# claude.ai Shell (Hosted Mode) — Fork Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hosted (Corat SaaS) modda Agent Canvas kabuğunu claude.ai düzenine çevirmek: sidebar (nav + son sohbetler + hesap/misafir CTA), ana ekran (serif selamlama + composer kartı), sohbet görünümü (48rem kolon, avatarlı kullanıcı balonu, balonsuz asistan, hover aksiyon çubuğu, üst çubuk, sağ panel), scrollbar ve menüler.

**Architecture:** Yeni kabuk `src/components/features/shell/` altında toplanır ve **yalnızca `isHostedMode()` true iken** kullanılır; local mod ve mevcut testleri dokunulmadan kalır. İş mantığı (conversation hooks, `CustomChatInput`, `ConversationMain`, event akışı) yeniden yazılmaz; yeni kabuk bunları sarar. Kimlik `GET /api/me` (gateway) üzerinden `useGatewayMe` ile gelir; misafirde CTA, üyede hesap menüsü.

**Tech Stack:** React 19 + React Router (SPA, `src/routes.ts`), Tailwind v4 (`@theme inline` tokenları `src/tailwind.css`), zustand, @tanstack/react-query, lucide-react, i18next (`src/i18n/translation.json` → `npm run make-i18n` → `I18nKey` enum), vitest + RTL (`__tests__/`), Playwright.

**Spec:** `../corat-control-plane/docs/superpowers/specs/2026-09-07-guest-chat-claude-shell-design.md` — §4 (fork), ölçü tablosu §4.2

## Global Constraints

- Yeni kabuk `isHostedMode()` (`#/api/agent-server-config`) arkasında; hosted olmayan yol değişmez. Testlerde `vi.mock("#/api/agent-server-config", ...)` ile `isHostedMode: () => true` verilir.
- `fetch` doğrudan yalnızca gateway uçları için (`/api/me`, `/api/auth/sign-out`) ve **her seferinde** `// eslint-disable-next-line local/no-direct-agent-server-fetch -- gateway (control-plane) endpoint on the serving origin, not an agent-server API.` yorumu ile (mevcut `hosted-profile-tile.tsx` deseni).
- i18n: her yeni metin `translation.json`'a 15 dille eklenir (en, zh-CN, zh-TW, de, ko-KR, no, it, pt, es, ar, fr, tr, ja, uk, ca); `npm run make-i18n` sonra `I18nKey.X` kullanılır. `npm run check-translation-completeness` temiz olmalı (lint-staged çalıştırır).
- Ölçüler tek dosyadan: `src/components/features/shell/shell-tokens.ts` (spec §4.2). Bileşenler oradaki sabitleri kullanır, sayı tekrar etmez.
- Renk tokenları: zemin `bg-base` (#FAF9F5), sidebar `bg-[var(--cool-grey-925)]`, hover `bg-[var(--cool-grey-900)]`, aktif `bg-[var(--cool-grey-800)]`, kenarlık `border-[var(--oh-border)]` (cool-grey-700), ince ayraç `var(--oh-border-subtle)`, mürekkep `text-content-2`/`var(--cool-grey-50)`, ikincil metin `text-[var(--cool-grey-200)]`, muted `text-[var(--oh-muted)]`, kiremit `bg-[var(--oh-accent)]` (#C6613F, hover `#B5502F`).
- Hover renkleri anlık (`transition-none`), sidebar genişliği `transition-[width] duration-200`.
- Fontlar: UI Inter (varsayılan body), selamlama ve asistan prose Source Serif 4 (`font-serif` yok; `font-[family-name:'Source_Serif_4']` yerine `index.css`'teki `.markdown-body` gibi sınıf: `font-serif-shell` tanımı Task 2'de).
- Testler: `npx vitest run <dosya>`; `npm run make-i18n` testten önce (npm test bunu yapar). Lint: `npm run lint` (typecheck + eslint + prettier).
- Commit mesajları İngilizce; `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` ile biter. Husky pre-commit lint-staged'i çalıştırır (eslint --fix, prettier, staged typecheck, translation completeness) — `--no-verify` KULLANILMAZ.

---

### Task 0: Bekleyen restyle değişikliklerini commit'le (temiz taban)

Fork çalışma ağacında 2026-09-03 claude.ai restyle'ından ~200 dosya commit'lenmemiş duruyor. Yeni kabuk bunun üstüne gelir.

**Files:**
- Tümü (mevcut `git status` çıktısı)

- [ ] **Step 1: Doğrula**

Run: `npm run typecheck`
Expected: hatasız. Hata varsa önce düzelt (restyle'ın kendi işi, bu plana ait değil).

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "style: claude.ai design language restyle (warm ivory, terracotta, serif prose)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

Hook uzun sürebilir (lint-staged ~200 dosya). Hook bir dosyada eslint/prettier hatası bulursa düzeltip yeniden commit'le.

---

### Task 1: i18n anahtarları

**Files:**
- Modify: `src/i18n/translation.json` (sona, son `}` öncesine 18 anahtar)
- Generated: `src/i18n/declaration.ts` (`npm run make-i18n`)

**Interfaces:**
- Produces: `I18nKey.SHELL$CHATS`, `SHELL$RECENTS`, `SHELL$GREETING_MORNING`, `SHELL$GREETING_AFTERNOON`, `SHELL$GREETING_EVENING` (hepsi `{{name}}`), `SHELL$GUEST_GREETING`, `SHELL$SIGN_IN`, `SHELL$SIGN_UP`, `SHELL$GUEST_HINT`, `SHELL$GUEST_HINT_CTA`, `SHELL$FREE_PLAN`, `SHELL$RENAME`, `SHELL$DELETE_CHAT`, `SHELL$SHARE`, `SHELL$ACCOUNT_MENU`, `SHELL$DISMISS`, `SHELL$SEND`, `SHELL$CHAT_OPTIONS`.
- Mevcut anahtarlar yeniden kullanılır: `SIDEBAR$NEW_CHAT`, `SIDEBAR$EXPAND`, `SIDEBAR$COLLAPSE`, `SIDEBAR$SETTINGS`, `NAV$CUSTOMIZE`, `ACCOUNT_SETTINGS$LOGOUT`, `COMMON$SHOW_PANEL`, `COMMON$HIDE_PANEL`, `CHAT_INTERFACE$MESSAGE_RETRY`, `SIDEBAR$NAVIGATION_LABEL`, `SIDEBAR$CLOSE_MENU`.

- [ ] **Step 1: Anahtarları ekle**

`src/i18n/translation.json` içinde son anahtarın ardından (virgülü unutma):

```json
  "SHELL$CHATS": { "en": "Chats", "zh-CN": "对话", "zh-TW": "對話", "de": "Unterhaltungen", "ko-KR": "채팅", "no": "Samtaler", "it": "Conversazioni", "pt": "Conversas", "es": "Conversaciones", "ar": "المحادثات", "fr": "Discussions", "tr": "Sohbetler", "ja": "チャット", "uk": "Чати", "ca": "Converses" },
  "SHELL$RECENTS": { "en": "Recents", "zh-CN": "最近", "zh-TW": "最近", "de": "Zuletzt", "ko-KR": "최근", "no": "Nylige", "it": "Recenti", "pt": "Recentes", "es": "Recientes", "ar": "الأخيرة", "fr": "Récents", "tr": "Son sohbetler", "ja": "最近", "uk": "Останні", "ca": "Darrers" },
  "SHELL$GREETING_MORNING": { "en": "Good morning, {{name}}", "zh-CN": "早上好，{{name}}", "zh-TW": "早安，{{name}}", "de": "Guten Morgen, {{name}}", "ko-KR": "좋은 아침이에요, {{name}}", "no": "God morgen, {{name}}", "it": "Buongiorno, {{name}}", "pt": "Bom dia, {{name}}", "es": "Buenos días, {{name}}", "ar": "صباح الخير، {{name}}", "fr": "Bonjour, {{name}}", "tr": "Günaydın, {{name}}", "ja": "おはようございます、{{name}}さん", "uk": "Доброго ранку, {{name}}", "ca": "Bon dia, {{name}}" },
  "SHELL$GREETING_AFTERNOON": { "en": "Good afternoon, {{name}}", "zh-CN": "下午好，{{name}}", "zh-TW": "午安，{{name}}", "de": "Guten Tag, {{name}}", "ko-KR": "좋은 오후예요, {{name}}", "no": "God ettermiddag, {{name}}", "it": "Buon pomeriggio, {{name}}", "pt": "Boa tarde, {{name}}", "es": "Buenas tardes, {{name}}", "ar": "مساء الخير، {{name}}", "fr": "Bon après-midi, {{name}}", "tr": "İyi günler, {{name}}", "ja": "こんにちは、{{name}}さん", "uk": "Доброго дня, {{name}}", "ca": "Bona tarda, {{name}}" },
  "SHELL$GREETING_EVENING": { "en": "Good evening, {{name}}", "zh-CN": "晚上好，{{name}}", "zh-TW": "晚安，{{name}}", "de": "Guten Abend, {{name}}", "ko-KR": "좋은 저녁이에요, {{name}}", "no": "God kveld, {{name}}", "it": "Buonasera, {{name}}", "pt": "Boa noite, {{name}}", "es": "Buenas noches, {{name}}", "ar": "طاب مساؤك، {{name}}", "fr": "Bonsoir, {{name}}", "tr": "İyi akşamlar, {{name}}", "ja": "こんばんは、{{name}}さん", "uk": "Добрий вечір, {{name}}", "ca": "Bona nit, {{name}}" },
  "SHELL$GUEST_GREETING": { "en": "What shall we do today?", "zh-CN": "今天我们做点什么？", "zh-TW": "今天我們做點什麼？", "de": "Was machen wir heute?", "ko-KR": "오늘 무엇을 해볼까요?", "no": "Hva skal vi gjøre i dag?", "it": "Cosa facciamo oggi?", "pt": "O que vamos fazer hoje?", "es": "¿Qué hacemos hoy?", "ar": "ماذا سنفعل اليوم؟", "fr": "Que faisons-nous aujourd'hui ?", "tr": "Bugün ne yapalım?", "ja": "今日は何をしましょう？", "uk": "Що робимо сьогодні?", "ca": "Què fem avui?" },
  "SHELL$SIGN_IN": { "en": "Log in", "zh-CN": "登录", "zh-TW": "登入", "de": "Anmelden", "ko-KR": "로그인", "no": "Logg inn", "it": "Accedi", "pt": "Entrar", "es": "Iniciar sesión", "ar": "تسجيل الدخول", "fr": "Se connecter", "tr": "Giriş yap", "ja": "ログイン", "uk": "Увійти", "ca": "Inicia la sessió" },
  "SHELL$SIGN_UP": { "en": "Sign up", "zh-CN": "注册", "zh-TW": "註冊", "de": "Registrieren", "ko-KR": "가입하기", "no": "Registrer deg", "it": "Registrati", "pt": "Criar conta", "es": "Registrarse", "ar": "إنشاء حساب", "fr": "S'inscrire", "tr": "Kaydol", "ja": "新規登録", "uk": "Зареєструватися", "ca": "Registra't" },
  "SHELL$GUEST_HINT": { "en": "You're trying Corat as a guest", "zh-CN": "你正在以访客身份试用 Corat", "zh-TW": "你正在以訪客身分試用 Corat", "de": "Du testest Corat als Gast", "ko-KR": "게스트로 Corat을 사용 중입니다", "no": "Du prøver Corat som gjest", "it": "Stai provando Corat come ospite", "pt": "Você está experimentando o Corat como visitante", "es": "Estás probando Corat como invitado", "ar": "أنت تجرّب Corat كضيف", "fr": "Vous essayez Corat en tant qu'invité", "tr": "Misafir olarak deniyorsun", "ja": "ゲストとして Corat を試しています", "uk": "Ви пробуєте Corat як гість", "ca": "Estàs provant Corat com a convidat" },
  "SHELL$GUEST_HINT_CTA": { "en": "Sign up to keep your chats", "zh-CN": "注册以保存对话", "zh-TW": "註冊以保存對話", "de": "Registrieren, um deine Chats zu behalten", "ko-KR": "가입하고 채팅을 보관하세요", "no": "Registrer deg for å beholde samtalene", "it": "Registrati per conservare le chat", "pt": "Crie uma conta para guardar as conversas", "es": "Regístrate para conservar tus chats", "ar": "أنشئ حسابًا للاحتفاظ بمحادثاتك", "fr": "Inscrivez-vous pour conserver vos discussions", "tr": "Kaydol, sohbetlerin saklansın", "ja": "登録してチャットを保存", "uk": "Зареєструйтеся, щоб зберегти чати", "ca": "Registra't per conservar els xats" },
  "SHELL$FREE_PLAN": { "en": "Free plan", "zh-CN": "免费版", "zh-TW": "免費版", "de": "Kostenloser Plan", "ko-KR": "무료 플랜", "no": "Gratisplan", "it": "Piano gratuito", "pt": "Plano gratuito", "es": "Plan gratuito", "ar": "الخطة المجانية", "fr": "Offre gratuite", "tr": "Ücretsiz plan", "ja": "無料プラン", "uk": "Безкоштовний план", "ca": "Pla gratuït" },
  "SHELL$RENAME": { "en": "Rename", "zh-CN": "重命名", "zh-TW": "重新命名", "de": "Umbenennen", "ko-KR": "이름 바꾸기", "no": "Gi nytt navn", "it": "Rinomina", "pt": "Renomear", "es": "Renombrar", "ar": "إعادة تسمية", "fr": "Renommer", "tr": "Yeniden adlandır", "ja": "名前を変更", "uk": "Перейменувати", "ca": "Canvia el nom" },
  "SHELL$DELETE_CHAT": { "en": "Delete", "zh-CN": "删除", "zh-TW": "刪除", "de": "Löschen", "ko-KR": "삭제", "no": "Slett", "it": "Elimina", "pt": "Excluir", "es": "Eliminar", "ar": "حذف", "fr": "Supprimer", "tr": "Sil", "ja": "削除", "uk": "Видалити", "ca": "Suprimeix" },
  "SHELL$SHARE": { "en": "Share", "zh-CN": "分享", "zh-TW": "分享", "de": "Teilen", "ko-KR": "공유", "no": "Del", "it": "Condividi", "pt": "Compartilhar", "es": "Compartir", "ar": "مشاركة", "fr": "Partager", "tr": "Paylaş", "ja": "共有", "uk": "Поділитися", "ca": "Comparteix" },
  "SHELL$ACCOUNT_MENU": { "en": "Account menu", "zh-CN": "账户菜单", "zh-TW": "帳戶選單", "de": "Kontomenü", "ko-KR": "계정 메뉴", "no": "Kontomeny", "it": "Menu account", "pt": "Menu da conta", "es": "Menú de cuenta", "ar": "قائمة الحساب", "fr": "Menu du compte", "tr": "Hesap menüsü", "ja": "アカウントメニュー", "uk": "Меню облікового запису", "ca": "Menú del compte" },
  "SHELL$DISMISS": { "en": "Dismiss", "zh-CN": "关闭", "zh-TW": "關閉", "de": "Schließen", "ko-KR": "닫기", "no": "Lukk", "it": "Chiudi", "pt": "Fechar", "es": "Cerrar", "ar": "إغلاق", "fr": "Fermer", "tr": "Kapat", "ja": "閉じる", "uk": "Закрити", "ca": "Tanca" },
  "SHELL$SEND": { "en": "Send message", "zh-CN": "发送消息", "zh-TW": "傳送訊息", "de": "Nachricht senden", "ko-KR": "메시지 보내기", "no": "Send melding", "it": "Invia messaggio", "pt": "Enviar mensagem", "es": "Enviar mensaje", "ar": "إرسال الرسالة", "fr": "Envoyer le message", "tr": "Mesaj gönder", "ja": "メッセージを送信", "uk": "Надіслати повідомлення", "ca": "Envia el missatge" },
  "SHELL$CHAT_OPTIONS": { "en": "Chat options", "zh-CN": "对话选项", "zh-TW": "對話選項", "de": "Chat-Optionen", "ko-KR": "채팅 옵션", "no": "Samtalevalg", "it": "Opzioni chat", "pt": "Opções da conversa", "es": "Opciones del chat", "ar": "خيارات المحادثة", "fr": "Options de la discussion", "tr": "Sohbet seçenekleri", "ja": "チャットのオプション", "uk": "Параметри чату", "ca": "Opcions del xat" }
```

Dosyanın geri kalanı tek satırlık değil, çok satırlı JSON — bu blokları da aynı biçime çevirmek gerekmez, JSON geçerli olsun yeter (prettier `src/**/*.json`'ı formatlamaz).

- [ ] **Step 2: Üret ve doğrula**

Run: `npm run make-i18n && npm run check-translation-completeness`
Expected: `src/i18n/declaration.ts` içinde `SHELL$CHATS = "SHELL$CHATS"` vb. satırlar; completeness script hatasız.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/translation.json src/i18n/declaration.ts
git commit -m "i18n: shell strings for the hosted claude-style layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: `shell-tokens.ts` + `useGatewayMe`

**Files:**
- Create: `src/components/features/shell/shell-tokens.ts`
- Create: `src/components/features/shell/sidebar/use-gateway-me.ts`
- Modify: `src/index.css` (`.font-serif-shell`)
- Test: `__tests__/components/features/shell/use-gateway-me.test.tsx`

**Interfaces:**
- Produces:
  ```ts
  export const SHELL = { sidebarExpandedWidth: "w-72", sidebarCollapsedWidth: "w-12", navRow: string, navRowIdle: string, navRowActive: string, sectionLabel: string, column: string, greeting: string, composerCard: string, composerCardFocus: string, userBubble: string, avatar: string, menu: string, menuItem: string, menuItemDanger: string, iconButton: string, topbar: string, panelWidth: string } as const;
  export const SHELL_ICON = 16;
  export type GatewayMeStatus = "loading" | "member" | "guest" | "unavailable";
  export interface GatewayMe { status: GatewayMeStatus; user: { name?: string; email?: string } | null; isGuest: boolean; }
  export function useGatewayMe(): GatewayMe;
  export async function signOutFromGateway(): Promise<void>; // POST /api/auth/sign-out → window.location.href = "/login"
  export function firstName(user: GatewayMe["user"]): string | null;
  ```
- `isGuest` = `status !== "member"` — gateway'siz açılışta (404) da misafir CTA gösterilir (spec §4.4).

- [ ] **Step 1: Failing test**

`__tests__/components/features/shell/use-gateway-me.test.tsx`:

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  firstName,
  signOutFromGateway,
  useGatewayMe,
} from "#/components/features/shell/sidebar/use-gateway-me";

function mockFetchOnce(status: number, body?: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useGatewayMe", () => {
  it("resolves a member", async () => {
    mockFetchOnce(200, { user: { name: "Sait Yasin", email: "s@corat.ai", isAnonymous: false } });
    const { result } = renderHook(() => useGatewayMe());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("member"));
    expect(result.current.isGuest).toBe(false);
    expect(result.current.user?.name).toBe("Sait Yasin");
  });

  it("resolves a guest when the gateway says isAnonymous", async () => {
    mockFetchOnce(200, { user: { name: "Misafir", email: "x@anonymous.placeholder.invalid", isAnonymous: true } });
    const { result } = renderHook(() => useGatewayMe());
    await waitFor(() => expect(result.current.status).toBe("guest"));
    expect(result.current.isGuest).toBe(true);
  });

  it("treats 401/404/network failure as unavailable (guest CTA)", async () => {
    mockFetchOnce(404);
    const { result } = renderHook(() => useGatewayMe());
    await waitFor(() => expect(result.current.status).toBe("unavailable"));
    expect(result.current.isGuest).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("signs out through the gateway and lands on /login", async () => {
    const fetchMock = mockFetchOnce(200, {});
    const go = vi.fn();
    await signOutFromGateway(go);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/sign-out",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
    expect(go).toHaveBeenCalledWith("/login");
  });

  it("still lands on /login when the sign-out request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const go = vi.fn();
    await signOutFromGateway(go);
    expect(go).toHaveBeenCalledWith("/login");
  });

  it("firstName takes the first word, falls back to email local part", () => {
    expect(firstName({ name: "Sait Yasin" })).toBe("Sait");
    expect(firstName({ email: "ada@example.com" })).toBe("ada");
    expect(firstName(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Çalıştır, başarısız gör**

Run: `npx vitest run __tests__/components/features/shell/use-gateway-me.test.tsx`
Expected: FAIL — modül yok.

- [ ] **Step 3: Tokenlar**

`src/components/features/shell/shell-tokens.ts`:

```ts
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
    "rounded-2xl border border-[var(--oh-border)] bg-white",
    "shadow-[0_1px_2px_rgba(31,29,23,0.04),0_0_0_1px_rgba(31,29,23,0.02)]",
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
    "z-50 min-w-[12rem] rounded-xl border border-[var(--oh-border)] bg-white p-1",
    "shadow-[0_8px_24px_rgba(31,29,23,0.10)]",
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
  panelSurface: "bg-white border-l border-[var(--oh-border-subtle)]",
} as const;
```

`src/index.css` `.markdown-body` bloğunun üstüne:

```css
/* claude.ai shell: serif selamlama ve asistan metni (Source Serif 4). */
.font-serif-shell {
  font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
}
```

- [ ] **Step 4: Hook**

`src/components/features/shell/sidebar/use-gateway-me.ts`:

```ts
import React from "react";

export type GatewayMeStatus = "loading" | "member" | "guest" | "unavailable";

export interface GatewayUser {
  name?: string;
  email?: string;
}

export interface GatewayMe {
  status: GatewayMeStatus;
  user: GatewayUser | null;
  /** member dışındaki her durum misafir CTA gösterir (gateway yoksa da). */
  isGuest: boolean;
}

type MeResponse = {
  user?: GatewayUser & { isAnonymous?: boolean | null };
};

/**
 * Kimlik gateway'den gelir: SPA gateway origin'inden servis edildiği için
 * same-origin `fetch("/api/me")` better-auth cookie'sini taşır. Bilinçli
 * olarak react-query DEĞİL: bu uç registry'deki hiçbir backend'e ait değil,
 * backend-scoped invalidation'larla birlikte yeniden çekilmemeli.
 */
export function useGatewayMe(): GatewayMe {
  const [state, setState] = React.useState<Omit<GatewayMe, "isGuest">>({
    status: "loading",
    user: null,
  });

  React.useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line local/no-direct-agent-server-fetch -- gateway (control-plane) endpoint on the serving origin, not an agent-server API; must NOT go through any backend client.
    fetch("/api/me", { credentials: "same-origin", signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          setState({ status: "unavailable", user: null });
          return;
        }
        const data = (await res.json()) as MeResponse;
        if (!data.user) {
          setState({ status: "unavailable", user: null });
          return;
        }
        const { isAnonymous, ...user } = data.user;
        setState({ status: isAnonymous === true ? "guest" : "member", user });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "unavailable", user: null });
      });
    return () => controller.abort();
  }, []);

  return { ...state, isGuest: state.status !== "member" };
}

const defaultNavigate = (href: string) => {
  window.location.href = href;
};

/** `go` testte enjekte edilir; üründe tam sayfa yönlendirme. */
export async function signOutFromGateway(go: (href: string) => void = defaultNavigate): Promise<void> {
  try {
    // eslint-disable-next-line local/no-direct-agent-server-fetch -- gateway better-auth endpoint, same reasoning as /api/me above.
    await fetch("/api/auth/sign-out", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
  } catch {
    // İstek düşse bile /login güvenli iniş noktası: oturumu sunucu yeniden kontrol eder.
  }
  go("/login");
}

export function firstName(user: GatewayUser | null): string | null {
  if (!user) return null;
  const name = user.name?.trim();
  if (name) return name.split(/\s+/)[0] ?? null;
  const local = user.email?.split("@")[0]?.trim();
  return local || null;
}
```

- [ ] **Step 5: Çalıştır, geçtiğini gör**

Run: `npx vitest run __tests__/components/features/shell/use-gateway-me.test.tsx`
Expected: PASS (6).

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/components/features/shell src/index.css
git add src/components/features/shell src/index.css __tests__/components/features/shell
git commit -m "feat(shell): design tokens and gateway identity hook for the hosted shell

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: `ShellMenu` + `SidebarAccount` (hesap menüsü / misafir CTA)

**Files:**
- Create: `src/components/features/shell/menu.tsx`
- Create: `src/components/features/shell/sidebar/sidebar-account.tsx`
- Test: `__tests__/components/features/shell/sidebar-account.test.tsx`

**Interfaces:**
- Produces:
  ```tsx
  export function ShellMenu({ open, onClose, anchor = "bottom-left", className, children, testId, ignoreOutsideClickRef }: { open: boolean; onClose: () => void; anchor?: "bottom-left" | "top-left" | "bottom-right"; className?: string; children: React.ReactNode; testId?: string; ignoreOutsideClickRef?: React.RefObject<HTMLElement | null> }): JSX.Element | null;
  export function ShellMenuItem({ icon, label, onClick, danger, testId, href }: {...}): JSX.Element;
  export function SidebarAccount({ collapsed }: { collapsed: boolean }): JSX.Element;
  ```
- Consumes: `useGatewayMe`, `signOutFromGateway`, `firstName` (Task 2); `SHELL` tokenları.

- [ ] **Step 1: Failing test**

`__tests__/components/features/shell/sidebar-account.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import translations from "#/i18n/translation.json";

const mockMe = vi.fn();
const mockSignOut = vi.fn();
vi.mock("#/components/features/shell/sidebar/use-gateway-me", async () => {
  const actual = await vi.importActual<typeof import("#/components/features/shell/sidebar/use-gateway-me")>(
    "#/components/features/shell/sidebar/use-gateway-me",
  );
  return { ...actual, useGatewayMe: () => mockMe(), signOutFromGateway: () => mockSignOut() };
});
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => (translations as Record<string, Record<string, string>>)[key]?.en ?? key,
  }),
}));
vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({ currentPath: "/", conversationId: null, isNavigating: false, navigate: vi.fn() }),
}));

import { SidebarAccount } from "#/components/features/shell/sidebar/sidebar-account";

beforeEach(() => {
  mockMe.mockReset();
  mockSignOut.mockReset();
});

describe("SidebarAccount", () => {
  it("shows Log in / Sign up links for a guest", () => {
    mockMe.mockReturnValue({ status: "guest", user: { name: "Misafir" }, isGuest: true });
    render(<SidebarAccount collapsed={false} />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
    expect(screen.queryByTestId("shell-account-tile")).toBeNull();
  });

  it("shows the CTA when the gateway is unavailable, too", () => {
    mockMe.mockReturnValue({ status: "unavailable", user: null, isGuest: true });
    render(<SidebarAccount collapsed={false} />);
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });

  it("renders the member tile with initial, name and plan, and opens the menu", () => {
    mockMe.mockReturnValue({ status: "member", user: { name: "Sait Yasin", email: "s@corat.ai" }, isGuest: false });
    render(<SidebarAccount collapsed={false} />);
    const tile = screen.getByTestId("shell-account-tile");
    expect(tile).toHaveTextContent("S");
    expect(tile).toHaveTextContent("Sait Yasin");
    expect(tile).toHaveTextContent("Free plan");

    fireEvent.click(tile);
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/settings");
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("collapsed: only the avatar, still opens the menu", () => {
    mockMe.mockReturnValue({ status: "member", user: { name: "Ada" }, isGuest: false });
    render(<SidebarAccount collapsed />);
    const tile = screen.getByTestId("shell-account-tile");
    expect(tile).toHaveTextContent("A");
    expect(tile).not.toHaveTextContent("Free plan");
    fireEvent.click(tile);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("collapsed guest: a single Log in icon link", () => {
    mockMe.mockReturnValue({ status: "guest", user: null, isGuest: true });
    render(<SidebarAccount collapsed />);
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute("href", "/login");
  });
});
```

- [ ] **Step 2: Çalıştır, başarısız gör**

Run: `npx vitest run __tests__/components/features/shell/sidebar-account.test.tsx`
Expected: FAIL — modül yok.

- [ ] **Step 3: `ShellMenu`**

`src/components/features/shell/menu.tsx`:

```tsx
import React from "react";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { NavigationLink } from "#/components/shared/navigation-link";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "./shell-tokens";

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
  const ref = useClickOutsideElement<HTMLUListElement>(onClose, ignoreOutsideClickRef);

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
        <NavigationLink to={href} role="menuitem" data-testid={testId} className={className} onClick={onClick}>
          {body}
        </NavigationLink>
      ) : (
        <button type="button" role="menuitem" data-testid={testId} className={className} onClick={onClick}>
          {body}
        </button>
      )}
    </li>
  );
}

export { SHELL_ICON as SHELL_MENU_ICON };
```

`src/index.css` sonuna:

```css
@keyframes shell-menu-in {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 4: `SidebarAccount`**

`src/components/features/shell/sidebar/sidebar-account.tsx`:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { LogIn, LogOut, Settings } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "../shell-tokens";
import { ShellMenu, ShellMenuItem } from "../menu";
import { firstName, signOutFromGateway, useGatewayMe } from "./use-gateway-me";

/**
 * Sidebar'ın en altı. Üye: avatar + ad + "Ücretsiz plan", tıklayınca
 * yukarı açılan menü (Ayarlar, Çıkış). Misafir (veya gateway yok): "Giriş
 * yap" / "Kaydol" — gateway'in kendi sayfaları, tam sayfa geçiş (<a>).
 */
export function SidebarAccount({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation("openhands");
  const me = useGatewayMe();
  const [open, setOpen] = React.useState(false);
  const tileRef = React.useRef<HTMLButtonElement>(null);

  if (me.status === "loading") {
    return <div className="h-12 shrink-0" aria-hidden />;
  }

  if (me.isGuest) {
    if (collapsed) {
      return (
        <a
          href="/login"
          aria-label={t(I18nKey.SHELL$SIGN_IN)}
          title={t(I18nKey.SHELL$SIGN_IN)}
          className={cn(SHELL.iconButton, "mx-auto mb-2 size-8")}
        >
          <LogIn width={SHELL_ICON} height={SHELL_ICON} />
        </a>
      );
    }
    return (
      <div data-testid="shell-guest-cta" className="flex flex-col gap-2 px-2 pb-2">
        <a
          href="/login"
          className={cn(
            "flex h-9 items-center justify-center rounded-lg border border-[var(--oh-border)] text-sm text-content-2",
            "hover:bg-[var(--cool-grey-900)] transition-none",
          )}
        >
          {t(I18nKey.SHELL$SIGN_IN)}
        </a>
        <a
          href="/signup"
          className="flex h-9 items-center justify-center rounded-lg bg-[var(--oh-accent)] text-sm font-medium text-white hover:bg-[#B5502F] transition-none"
        >
          {t(I18nKey.SHELL$SIGN_UP)}
        </a>
      </div>
    );
  }

  const displayName = me.user?.name?.trim() || me.user?.email || "";
  const initial = (firstName(me.user) ?? "?").charAt(0).toUpperCase();

  return (
    <div className={cn("relative shrink-0", collapsed ? "mx-auto mb-2" : "px-2 pb-2")}>
      <button
        ref={tileRef}
        type="button"
        data-testid="shell-account-tile"
        aria-label={t(I18nKey.SHELL$ACCOUNT_MENU)}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg text-left transition-none",
          collapsed ? "size-8 justify-center" : "h-12 px-2 hover:bg-[var(--cool-grey-900)]",
          open && "bg-[var(--cool-grey-900)]",
        )}
      >
        <span className={SHELL.avatar}>{initial}</span>
        {!collapsed ? (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm leading-5 text-content-2">{displayName}</span>
            <span className="block truncate text-xs leading-4 text-[var(--oh-muted)]">
              {t(I18nKey.SHELL$FREE_PLAN)}
            </span>
          </span>
        ) : null}
      </button>
      <ShellMenu
        open={open}
        onClose={() => setOpen(false)}
        anchor="top-left"
        ignoreOutsideClickRef={tileRef}
        testId="shell-account-menu"
        className={cn(collapsed && "left-full bottom-0 ml-2 mb-0")}
      >
        <ShellMenuItem
          href="/settings"
          icon={<Settings />}
          label={t(I18nKey.SIDEBAR$SETTINGS)}
          onClick={() => setOpen(false)}
        />
        <ShellMenuItem
          icon={<LogOut />}
          label={t(I18nKey.ACCOUNT_SETTINGS$LOGOUT)}
          onClick={() => {
            setOpen(false);
            void signOutFromGateway();
          }}
        />
      </ShellMenu>
    </div>
  );
}
```

- [ ] **Step 5: Çalıştır, geçtiğini gör**

Run: `npx vitest run __tests__/components/features/shell/sidebar-account.test.tsx`
Expected: PASS (5). `NavigationLink`'in `role` prop'unu geçirmesi gerekir — `...props` yayıyor, geçer.

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/components/features/shell src/index.css
git add src/components/features/shell src/index.css __tests__/components/features/shell
git commit -m "feat(shell): claude-style menu primitive and sidebar account / guest CTA

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: `SidebarRecents` — son sohbetler (yeniden adlandır / sil)

**Files:**
- Create: `src/components/features/shell/sidebar/sidebar-recents.tsx`
- Test: `__tests__/components/features/shell/sidebar-recents.test.tsx`

**Interfaces:**
- Produces: `export function SidebarRecents({ limit = 20 }: { limit?: number }): JSX.Element | null`
- Consumes: `usePaginatedConversations(limit)` → `data.pages[].items: AppConversation[]` (`id`, `title`, `updated_at`), `useUpdateConversation().mutate({ conversationId, newTitle })`, `useDeleteConversation().mutate({ conversationId })`, `useNavigation()` (`conversationId`, `navigate`), `ConfirmDeleteModal({ onConfirm, onCancel, conversationTitle })`.

- [ ] **Step 1: Failing test**

`__tests__/components/features/shell/sidebar-recents.test.tsx`:

```tsx
import { render, screen, fireEvent, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import translations from "#/i18n/translation.json";

const mockNavigate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
let currentConversationId: string | null = null;
let items: Array<{ id: string; title: string | null; updated_at: string }> = [];

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const raw = (translations as Record<string, Record<string, string>>)[key]?.en ?? key;
      return raw.replace(/\{\{(\w+)\}\}/g, (_, k) => opts?.[k] ?? "");
    },
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));
vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({ currentPath: "/", conversationId: currentConversationId, isNavigating: false, navigate: mockNavigate }),
}));
vi.mock("#/hooks/query/use-paginated-conversations", () => ({
  usePaginatedConversations: () => ({ data: { pages: [{ items, next_page_id: null }] }, isLoading: false }),
}));
vi.mock("#/hooks/mutation/use-update-conversation", () => ({
  useUpdateConversation: () => ({ mutate: mockUpdate }),
}));
vi.mock("#/hooks/mutation/use-delete-conversation", () => ({
  useDeleteConversation: () => ({ mutate: mockDelete }),
}));
vi.mock("#/components/features/conversation-panel/confirm-delete-modal", () => ({
  ConfirmDeleteModal: ({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) => (
    <div data-testid="confirm-delete">
      <button type="button" onClick={onConfirm}>confirm</button>
      <button type="button" onClick={onCancel}>cancel</button>
    </div>
  ),
}));

import { SidebarRecents } from "#/components/features/shell/sidebar/sidebar-recents";

beforeEach(() => {
  mockNavigate.mockReset();
  mockUpdate.mockReset();
  mockDelete.mockReset();
  currentConversationId = null;
  items = [
    { id: "c-old", title: "Eski sohbet", updated_at: "2026-09-01T10:00:00Z" },
    { id: "c-new", title: "Yeni sohbet", updated_at: "2026-09-07T10:00:00Z" },
    { id: "c-untitled", title: null, updated_at: "2026-09-05T10:00:00Z" },
  ];
});

describe("SidebarRecents", () => {
  it("lists conversations newest first under a 'Recents' label, linking to each", () => {
    render(<SidebarRecents />);
    expect(screen.getByText("Recents")).toBeInTheDocument();
    const links = screen.getAllByTestId("shell-recent-link");
    expect(links.map((l) => l.textContent)).toEqual(["Yeni sohbet", "c-untitled", "Eski sohbet"]);
    expect(links[0]).toHaveAttribute("href", "/conversations/c-new");
  });

  it("marks the active conversation", () => {
    currentConversationId = "c-old";
    render(<SidebarRecents />);
    const active = screen.getAllByTestId("shell-recent-row").find((r) => r.textContent?.includes("Eski sohbet"));
    expect(active).toHaveAttribute("data-active", "true");
  });

  it("renames inline from the row menu", () => {
    render(<SidebarRecents />);
    const row = screen.getAllByTestId("shell-recent-row")[0];
    fireEvent.click(within(row).getByLabelText("Chat options"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    const input = within(row).getByRole("textbox");
    fireEvent.change(input, { target: { value: "Yepyeni" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockUpdate).toHaveBeenCalledWith({ conversationId: "c-new", newTitle: "Yepyeni" });
  });

  it("deletes after confirmation and navigates home when the active chat is deleted", () => {
    currentConversationId = "c-new";
    render(<SidebarRecents />);
    const row = screen.getAllByTestId("shell-recent-row")[0];
    fireEvent.click(within(row).getByLabelText("Chat options"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    fireEvent.click(within(screen.getByTestId("confirm-delete")).getByText("confirm"));
    expect(mockDelete).toHaveBeenCalledWith({ conversationId: "c-new" });
    expect(mockNavigate).toHaveBeenCalledWith("/conversations");
  });

  it("renders nothing when there are no conversations", () => {
    items = [];
    const { container } = render(<SidebarRecents />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Çalıştır, başarısız gör**

Run: `npx vitest run __tests__/components/features/shell/sidebar-recents.test.tsx`
Expected: FAIL — modül yok.

- [ ] **Step 3: Bileşen**

`src/components/features/shell/sidebar/sidebar-recents.tsx`:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { NavigationLink } from "#/components/shared/navigation-link";
import { useNavigation } from "#/context/navigation-context";
import { usePaginatedConversations } from "#/hooks/query/use-paginated-conversations";
import { useUpdateConversation } from "#/hooks/mutation/use-update-conversation";
import { useDeleteConversation } from "#/hooks/mutation/use-delete-conversation";
import { ConfirmDeleteModal } from "#/components/features/conversation-panel/confirm-delete-modal";
import { hoverRevealActionClassName } from "#/utils/hover-reveal-classes";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "../shell-tokens";
import { ShellMenu, ShellMenuItem } from "../menu";

type Recent = Pick<AppConversation, "id" | "title" | "updated_at">;

function sortNewestFirst(list: Recent[]): Recent[] {
  return [...list].sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
}

/** claude.ai "Recents": düz liste, hover'da … menüsü (Yeniden adlandır, Sil). */
export function SidebarRecents({ limit = 20 }: { limit?: number }) {
  const { t } = useTranslation("openhands");
  const { data } = usePaginatedConversations(limit);
  const items = React.useMemo(
    () => sortNewestFirst(data?.pages.flatMap((p) => p.items) ?? []).slice(0, limit),
    [data, limit],
  );
  if (items.length === 0) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={SHELL.sectionLabel}>{t(I18nKey.SHELL$RECENTS)}</div>
      <ul className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
        {items.map((c) => (
          <RecentRow key={c.id} conversation={c} />
        ))}
      </ul>
    </div>
  );
}

function RecentRow({ conversation }: { conversation: Recent }) {
  const { t } = useTranslation("openhands");
  const { conversationId, navigate } = useNavigation();
  const { mutate: updateConversation } = useUpdateConversation();
  const { mutate: deleteConversation } = useDeleteConversation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const active = conversationId === conversation.id;
  const title = conversation.title?.trim() || conversation.id;

  React.useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commitRename = () => {
    const next = inputRef.current?.value.trim() ?? "";
    setEditing(false);
    if (next && next !== title) {
      updateConversation({ conversationId: conversation.id, newTitle: next });
    }
  };

  return (
    <li
      data-testid="shell-recent-row"
      data-active={active ? "true" : "false"}
      className={cn(
        "group relative",
        SHELL.navRow,
        "px-0 gap-0",
        active ? SHELL.navRowActive : SHELL.navRowIdle,
        menuOpen && "bg-[var(--cool-grey-900)]",
      )}
    >
      {editing ? (
        <input
          ref={inputRef}
          defaultValue={title}
          aria-label={t(I18nKey.SHELL$RENAME)}
          className="h-8 w-full rounded-lg bg-white px-2 text-sm text-content-2 outline-none ring-1 ring-[var(--oh-accent)]"
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <>
          <NavigationLink
            to={`/conversations/${conversation.id}`}
            data-testid="shell-recent-link"
            title={title}
            className="flex h-8 min-w-0 flex-1 items-center truncate px-2 pr-8"
          >
            {title}
          </NavigationLink>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={t(I18nKey.SHELL$CHAT_OPTIONS)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2",
              "flex size-6 items-center justify-center rounded-md text-[var(--oh-muted)] hover:bg-[var(--cool-grey-800)] hover:text-content-2 transition-none",
              hoverRevealActionClassName(menuOpen),
            )}
          >
            <Ellipsis width={SHELL_ICON} height={SHELL_ICON} />
          </button>
          <ShellMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            anchor="bottom-right"
            ignoreOutsideClickRef={menuButtonRef}
          >
            <ShellMenuItem
              icon={<Pencil />}
              label={t(I18nKey.SHELL$RENAME)}
              onClick={() => {
                setMenuOpen(false);
                setEditing(true);
              }}
            />
            <ShellMenuItem
              icon={<Trash2 />}
              label={t(I18nKey.SHELL$DELETE_CHAT)}
              danger
              onClick={() => {
                setMenuOpen(false);
                setConfirmDelete(true);
              }}
            />
          </ShellMenu>
        </>
      )}
      {confirmDelete ? (
        <ConfirmDeleteModal
          conversationTitle={title}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            deleteConversation({ conversationId: conversation.id });
            if (active) navigate("/conversations");
          }}
        />
      ) : null}
    </li>
  );
}
```

- [ ] **Step 4: Çalıştır, geçtiğini gör**

Run: `npx vitest run __tests__/components/features/shell/sidebar-recents.test.tsx`
Expected: PASS (5). `container` boş kontrolü için bileşen `null` dönmeli (tek `div` bile olmasın).

- [ ] **Step 5: Commit**

```bash
npx prettier --write src/components/features/shell
git add src/components/features/shell __tests__/components/features/shell
git commit -m "feat(shell): recents list with inline rename and delete

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: `ClaudeSidebar` (rail + peek + genişletilmiş + mobil drawer) ve `root-layout` bağlantısı

**Files:**
- Create: `src/components/features/shell/sidebar/sidebar-nav.tsx`
- Create: `src/components/features/shell/sidebar/sidebar-panel.tsx`
- Create: `src/components/features/shell/sidebar/claude-sidebar.tsx`
- Create: `src/components/features/shell/shell-mobile-topbar.tsx`
- Modify: `src/routes/root-layout.tsx`
- Test: `__tests__/components/features/shell/claude-sidebar.test.tsx`

**Interfaces:**
- Produces: `ClaudeSidebar()` (desktop aside + mobil drawer), `ShellMobileTopBar()` (hamburger + logo, `<md`), `SidebarNav({ collapsed })`, `SidebarPanel({ collapsed, onCollapse, showCollapseToggle, showMobileClose, onCloseMobile })`.
- Consumes: `useSidebarStore` (`collapsed`, `setCollapsed`), `useSidebarMobileNav` (`isOpen`, `open`, `close`), `useNavigation().currentPath`, `hasAutomationInterface()/automationListPath()/getInterfaceCopy().sidebarLabel`, `CUSTOMIZE_PATH`, `CoratLogo` svg, Task 3–4 bileşenleri.
- Davranış: daralmışken rail 3rem; rail'e gelince 150 ms sonra **peek** (genişletilmiş panel `absolute` overlay + gölge), ayrılınca kapanır; rail üstündeki toggle kalıcı genişletir. Genişken header'da daraltma düğmesi.

- [ ] **Step 1: Failing test**

`__tests__/components/features/shell/claude-sidebar.test.tsx`:

```tsx
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import translations from "#/i18n/translation.json";
import { useSidebarStore } from "#/stores/sidebar-store";
import { SidebarMobileNavProvider } from "#/components/features/sidebar/sidebar-mobile-nav-context";

let currentPath = "/conversations";
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => (translations as Record<string, Record<string, string>>)[key]?.en ?? key,
  }),
}));
vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({ currentPath, conversationId: null, isNavigating: false, navigate: vi.fn() }),
}));
vi.mock("#/components/features/shell/sidebar/use-gateway-me", () => ({
  useGatewayMe: () => ({ status: "member", user: { name: "Sait" }, isGuest: false }),
  signOutFromGateway: vi.fn(),
  firstName: () => "Sait",
}));
vi.mock("#/hooks/query/use-paginated-conversations", () => ({
  usePaginatedConversations: () => ({ data: { pages: [{ items: [], next_page_id: null }] }, isLoading: false }),
}));
vi.mock("#/manifests/automation-interface", () => ({
  hasAutomationInterface: () => true,
  automationListPath: () => "/automations",
  getInterfaceCopy: () => ({ sidebarLabel: "Automations" }),
}));
vi.mock("#/components/shared/buttons/styled-tooltip", () => ({
  StyledTooltip: ({ children }: { children: React.ReactNode }) => children,
}));

import { ClaudeSidebar } from "#/components/features/shell/sidebar/claude-sidebar";

function renderSidebar() {
  return render(
    <SidebarMobileNavProvider>
      <ClaudeSidebar />
    </SidebarMobileNavProvider>,
  );
}

beforeEach(() => {
  useSidebarStore.setState({ collapsed: false });
  currentPath = "/conversations";
});

describe("ClaudeSidebar", () => {
  it("expanded: shows New chat, Chats, Automations, Customize in order", () => {
    renderSidebar();
    const aside = screen.getByTestId("shell-sidebar");
    const labels = Array.from(aside.querySelectorAll("[data-testid^='shell-nav-']")).map((n) => n.textContent);
    expect(labels).toEqual(["New Chat", "Chats", "Automations", "Customize"]);
    expect(screen.getByTestId("shell-nav-new-chat")).toHaveAttribute("href", "/conversations");
    expect(screen.getByTestId("shell-nav-customize")).toHaveAttribute("href", "/customize");
    expect(aside.className).toContain("w-72");
  });

  it("collapses to a 3rem rail and expands again from the toggle", () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    const aside = screen.getByTestId("shell-sidebar");
    expect(aside.className).toContain("w-12");
    expect(useSidebarStore.getState().collapsed).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it("collapsed: hovering the rail peeks the expanded panel, leaving closes it", () => {
    vi.useFakeTimers();
    useSidebarStore.setState({ collapsed: true });
    renderSidebar();
    const aside = screen.getByTestId("shell-sidebar");
    fireEvent.mouseEnter(aside);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByTestId("shell-sidebar-peek")).toBeInTheDocument();
    fireEvent.mouseLeave(aside);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByTestId("shell-sidebar-peek")).toBeNull();
    vi.useRealTimers();
  });

  it("marks the current route active", () => {
    currentPath = "/customize";
    renderSidebar();
    expect(screen.getByTestId("shell-nav-customize")).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("shell-nav-new-chat")).not.toHaveAttribute("aria-current");
  });
});
```

Not: mevcut `SIDEBAR$COLLAPSE` / `SIDEBAR$EXPAND` İngilizce değerleri "Collapse sidebar" / "Expand sidebar" değilse testteki isimleri `translations["SIDEBAR$COLLAPSE"].en` değerine göre düzelt (`grep -n -A1 '"SIDEBAR\$COLLAPSE"' src/i18n/translation.json`).

- [ ] **Step 2: Çalıştır, başarısız gör**

Run: `npx vitest run __tests__/components/features/shell/claude-sidebar.test.tsx`
Expected: FAIL — modül yok.

- [ ] **Step 3: `SidebarNav`**

`src/components/features/shell/sidebar/sidebar-nav.tsx`:

```tsx
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
    isActive(currentPath, to, end) || extraActivePaths.some((p) => isActive(currentPath, p, false));
  const link = (
    <NavigationLink
      to={to}
      end={end}
      data-testid={testId}
      aria-label={collapsed ? label : undefined}
      className={cn(
        SHELL.navRow,
        collapsed && "justify-center px-0",
        active ? SHELL.navRowActive : SHELL.navRowIdle,
        emphasis && "text-content-2 font-medium",
      )}
    >
      <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
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
    <nav className={cn("flex flex-col gap-0.5", collapsed ? "items-center px-1" : "px-2")}>
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
```

"Sohbetler" ve "Yeni sohbet" aynı rotaya gider (spec §4.3); `end` sadece yeni sohbette olduğundan `/conversations/:id` iken "Sohbetler" aktif görünür, "Yeni sohbet" görünmez.

- [ ] **Step 4: `SidebarPanel`**

`src/components/features/shell/sidebar/sidebar-panel.tsx`:

```tsx
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
      <div className={cn("flex h-12 min-h-12 shrink-0 items-center", collapsed ? "justify-center" : "gap-2 px-3")}>
        <NavigationLink
          to="/conversations"
          aria-label={t(I18nKey.BRANDING$OPENHANDS_LOGO)}
          className="flex items-center"
        >
          <CoratLogo width={collapsed ? 26 : 34} height={collapsed ? 14 : 19} className="shrink-0" />
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
```

- [ ] **Step 5: `ClaudeSidebar` + mobil top bar**

`src/components/features/shell/sidebar/claude-sidebar.tsx`:

```tsx
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

  React.useEffect(() => {
    closeMobile();
    setPeek(false);
  }, [currentPath, closeMobile]);

  const clearPeekTimer = () => {
    if (peekTimer.current) clearTimeout(peekTimer.current);
    peekTimer.current = null;
  };
  const schedulePeek = (next: boolean) => {
    clearPeekTimer();
    peekTimer.current = setTimeout(() => setPeek(next), PEEK_DELAY_MS);
  };

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
            <SidebarPanel
              collapsed={false}
              showCollapseToggle={false}
            />
          </div>
        ) : null}
      </aside>

      {mobileOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeMobile} aria-hidden />
          <aside
            data-testid="shell-sidebar-mobile"
            aria-label={t(I18nKey.SIDEBAR$NAVIGATION_LABEL)}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col md:hidden",
              SHELL.sidebarSurface,
              "shadow-[0_8px_32px_rgba(31,29,23,0.18)]",
            )}
          >
            <SidebarPanel collapsed={false} showCollapseToggle={false} showMobileClose onCloseMobile={closeMobile} />
          </aside>
        </>
      ) : null}
    </>
  );
}
```

`src/components/features/shell/shell-mobile-topbar.tsx`:

```tsx
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
      <button type="button" aria-label={t(I18nKey.SIDEBAR$EXPAND)} onClick={open} className={SHELL.iconButton}>
        <Menu width={SHELL_ICON} height={SHELL_ICON} />
      </button>
      <CoratLogo width={34} height={19} />
    </div>
  );
}
```

- [ ] **Step 6: `root-layout` bağlantısı**

`src/routes/root-layout.tsx`:

```tsx
import { isHostedMode } from "#/api/agent-server-config";
import { ClaudeSidebar } from "#/components/features/shell/sidebar/claude-sidebar";
import { ShellMobileTopBar } from "#/components/features/shell/shell-mobile-topbar";
import { cn } from "#/utils/utils";
// ...
export default function MainApp() {
  // ...
  // Hosted (Corat SaaS): claude.ai kabuğu. Local: Agent Canvas kabuğu aynen.
  const hosted = isHostedMode();
  // ...
        <div
          data-testid="root-layout"
          data-shell={hosted ? "claude" : "canvas"}
          className="h-screen lg:min-w-5xl flex flex-col md:flex-row bg-base overflow-hidden p-0"
        >
          <title>{appTitle}</title>
          {hosted ? <ClaudeSidebar /> : <Sidebar />}

          <div className={cn("flex min-h-0 flex-col w-full min-w-0 h-full", hosted ? "gap-0" : "gap-3")}>
            {!hideMobileSidebarMenuBar ? (hosted ? <ShellMobileTopBar /> : <SidebarMobileMenuBar />) : null}
```

Geri kalanı aynen.

- [ ] **Step 7: Çalıştır, geçtiğini gör**

Run: `npx vitest run __tests__/components/features/shell/claude-sidebar.test.tsx __tests__/components/features/sidebar/sidebar.test.tsx`
Expected: PASS — yeni testler + eski sidebar testi (local yol değişmedi).

- [ ] **Step 8: Commit**

```bash
npx prettier --write src/components/features/shell src/routes/root-layout.tsx
git add src/components/features/shell src/routes/root-layout.tsx __tests__/components/features/shell
git commit -m "feat(shell): claude-style sidebar (rail, peek, drawer) wired into the hosted layout

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Ana ekran — serif selamlama, misafir ipucu, `HomeChatLauncher` claude varyantı

**Files:**
- Create: `src/components/features/shell/home/claude-greeting.tsx`
- Create: `src/components/features/shell/home/guest-hint.tsx`
- Modify: `src/components/features/home/home-chat-launcher.tsx` (`variant` prop)
- Modify: `src/routes/home.tsx`
- Test: `__tests__/components/features/shell/claude-greeting.test.tsx`, `__tests__/components/features/shell/guest-hint.test.tsx`

**Interfaces:**
- Produces: `ClaudeGreeting({ now?: () => Date })`, `GuestHint()`, `HomeChatLauncher({ variant?: "default" | "claude" })`.
- Selamlama kuralı: saat `<12` sabah, `<18` öğleden sonra, aksi akşam; üye + ad varsa `SHELL$GREETING_*` `{name}` = ilk ad; yoksa `SHELL$GUEST_GREETING`.
- Misafir ipucu: `localStorage["corat:guest-hint-dismissed"] === "1"` ise gizli; misafirde (`isGuest`) ve `status !== "loading"` iken görünür; kapatma bayrağı yazar.

- [ ] **Step 1: Failing test'ler**

`__tests__/components/features/shell/claude-greeting.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import translations from "#/i18n/translation.json";

const mockMe = vi.fn();
vi.mock("#/components/features/shell/sidebar/use-gateway-me", async () => {
  const actual = await vi.importActual<typeof import("#/components/features/shell/sidebar/use-gateway-me")>(
    "#/components/features/shell/sidebar/use-gateway-me",
  );
  return { ...actual, useGatewayMe: () => mockMe() };
});
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) =>
      ((translations as Record<string, Record<string, string>>)[key]?.en ?? key).replace(
        /\{\{(\w+)\}\}/g,
        (_, k) => opts?.[k] ?? "",
      ),
  }),
}));

import { ClaudeGreeting } from "#/components/features/shell/home/claude-greeting";

const at = (hour: number) => () => new Date(2026, 8, 7, hour, 0, 0);

describe("ClaudeGreeting", () => {
  it("greets a member by first name according to the hour", () => {
    mockMe.mockReturnValue({ status: "member", user: { name: "Sait Yasin" }, isGuest: false });
    const { rerender } = render(<ClaudeGreeting now={at(9)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Good morning, Sait");
    rerender(<ClaudeGreeting now={at(14)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Good afternoon, Sait");
    rerender(<ClaudeGreeting now={at(21)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Good evening, Sait");
  });

  it("uses the guest greeting for guests and while loading", () => {
    mockMe.mockReturnValue({ status: "guest", user: { name: "Misafir" }, isGuest: true });
    const { rerender } = render(<ClaudeGreeting now={at(9)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we do today?");
    mockMe.mockReturnValue({ status: "loading", user: null, isGuest: true });
    rerender(<ClaudeGreeting now={at(9)} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What shall we do today?");
  });
});
```

`__tests__/components/features/shell/guest-hint.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import translations from "#/i18n/translation.json";

const mockMe = vi.fn();
vi.mock("#/components/features/shell/sidebar/use-gateway-me", async () => {
  const actual = await vi.importActual<typeof import("#/components/features/shell/sidebar/use-gateway-me")>(
    "#/components/features/shell/sidebar/use-gateway-me",
  );
  return { ...actual, useGatewayMe: () => mockMe() };
});
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => (translations as Record<string, Record<string, string>>)[key]?.en ?? key,
  }),
}));

import { GUEST_HINT_DISMISSED_KEY, GuestHint } from "#/components/features/shell/home/guest-hint";

beforeEach(() => {
  localStorage.removeItem(GUEST_HINT_DISMISSED_KEY);
});

describe("GuestHint", () => {
  it("shows for a guest with a signup link and can be dismissed persistently", () => {
    mockMe.mockReturnValue({ status: "guest", user: null, isGuest: true });
    const { rerender } = render(<GuestHint />);
    expect(screen.getByText("You're trying Corat as a guest")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up to keep your chats" })).toHaveAttribute("href", "/signup");
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("You're trying Corat as a guest")).toBeNull();
    expect(localStorage.getItem(GUEST_HINT_DISMISSED_KEY)).toBe("1");
    rerender(<GuestHint />);
    expect(screen.queryByText("You're trying Corat as a guest")).toBeNull();
  });

  it("is hidden for members and while loading", () => {
    mockMe.mockReturnValue({ status: "member", user: { name: "Ada" }, isGuest: false });
    const { container, rerender } = render(<GuestHint />);
    expect(container).toBeEmptyDOMElement();
    mockMe.mockReturnValue({ status: "loading", user: null, isGuest: true });
    rerender(<GuestHint />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Çalıştır, başarısız gör**

Run: `npx vitest run __tests__/components/features/shell/claude-greeting.test.tsx __tests__/components/features/shell/guest-hint.test.tsx`
Expected: FAIL — modüller yok.

- [ ] **Step 3: Bileşenler**

`src/components/features/shell/home/claude-greeting.tsx`:

```tsx
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
export function ClaudeGreeting({ now = () => new Date() }: { now?: () => Date }) {
  const { t } = useTranslation("openhands");
  const me = useGatewayMe();
  const name = me.status === "member" ? firstName(me.user) : null;
  const text = name ? t(greetingKeyForHour(now().getHours()), { name }) : t(I18nKey.SHELL$GUEST_GREETING);
  return (
    <h1 data-testid="shell-greeting" className={SHELL.greeting}>
      <CoratLogo width={40} height={22} className="shrink-0" aria-hidden />
      <span>{text}</span>
    </h1>
  );
}
```

`src/components/features/shell/home/guest-hint.tsx`:

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { SHELL, SHELL_ICON } from "../shell-tokens";
import { useGatewayMe } from "../sidebar/use-gateway-me";

export const GUEST_HINT_DISMISSED_KEY = "corat:guest-hint-dismissed";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(GUEST_HINT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Composer üstü tek satır: "Misafir olarak deniyorsun · Kaydol, sohbetlerin saklansın". */
export function GuestHint() {
  const { t } = useTranslation("openhands");
  const me = useGatewayMe();
  const [dismissed, setDismissed] = React.useState(readDismissed);

  if (dismissed || me.status === "loading" || !me.isGuest) return null;

  return (
    <div
      data-testid="shell-guest-hint"
      className={cn(
        "mx-auto flex h-9 w-fit max-w-full items-center gap-2 rounded-full border border-[var(--oh-border)]",
        "bg-[var(--cool-grey-925)] pl-4 pr-1 text-sm text-[var(--cool-grey-200)]",
      )}
    >
      <span className="truncate">{t(I18nKey.SHELL$GUEST_HINT)}</span>
      <span aria-hidden className="text-[var(--cool-grey-500)]">·</span>
      <a href="/signup" className="shrink-0 text-[var(--oh-accent)] hover:underline">
        {t(I18nKey.SHELL$GUEST_HINT_CTA)}
      </a>
      <button
        type="button"
        aria-label={t(I18nKey.SHELL$DISMISS)}
        onClick={() => {
          try {
            localStorage.setItem(GUEST_HINT_DISMISSED_KEY, "1");
          } catch {
            /* localStorage yok; sadece bu oturumda gizle */
          }
          setDismissed(true);
        }}
        className={cn(SHELL.iconButton, "size-7 rounded-full")}
      >
        <X width={SHELL_ICON} height={SHELL_ICON} />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: `HomeChatLauncher` varyantı + `home.tsx`**

`src/components/features/home/home-chat-launcher.tsx`:

```tsx
import { ClaudeGreeting } from "#/components/features/shell/home/claude-greeting";
import { GuestHint } from "#/components/features/shell/home/guest-hint";
// ...
export function HomeChatLauncher({
  variant = "default",
}: {
  /** "claude": hosted kabuk — serif selamlama, misafir ipucu, otomasyon rayları ve workspace seçici gizli. */
  variant?: "default" | "claude";
} = {}) {
  const isClaude = variant === "claude";
  // ... (gövde aynen)
  return (
    <div
      data-testid="home-chat-launcher"
      className={cn(
        "flex w-full flex-col items-center pb-10",
        isClaude ? "pt-[max(5rem,30vh)]" : "pt-[max(4rem,28vh)]",
      )}
    >
      <div className={cn("flex w-full flex-col gap-4 md:px-4", isClaude ? "max-w-[48rem]" : "max-w-[800px]")}>
        <div className="flex w-full justify-center">
          {isClaude ? <ClaudeGreeting /> : <HomeHeaderTitle />}
        </div>
        {isClaude ? <GuestHint /> : null}

        <div className="w-full">
          <CustomChatInput ... />
        </div>

        {!isClaude ? (
          <div className="flex items-center justify-start gap-2">
            {/* mevcut hasSelection ? HomeGitControlBarPreview : OpenLauncherButton + PluginPickerTrigger */}
          </div>
        ) : null}

        {!isClaude ? (
          <div className="mt-8 flex w-full flex-col gap-8">
            <RecommendedAutomationsLauncher variant="rail" />
            <PinnedAutomationsDashboard />
            <RunningAutomationsList />
          </div>
        ) : null}
      </div>
      {/* dialog'lar aynen */}
    </div>
  );
}
```

(`cn` import: `#/utils/utils`.)

`src/routes/home.tsx`:

```tsx
import { isHostedMode } from "#/api/agent-server-config";
// ...
function HomeScreen() {
  const location = useLocation();
  const isPreview = isOnboardingPreviewActive(location.search);
  // Hosted: LLM gateway'den gelir (banner anlamsız), onboarding checklist yok.
  const hosted = isHostedMode();

  return (
    <div
      data-testid="home-screen"
      className="custom-scrollbar-always h-full overflow-y-auto rounded-xl bg-transparent px-4 md:px-0 lg:px-[42px]"
    >
      {!hosted ? (
        <div className="md:px-4 lg:px-0">
          <LlmNotConfiguredBanner />
        </div>
      ) : null}

      <HomeChatLauncher variant={hosted ? "claude" : "default"} />

      {!isPreview && !hosted ? <OnboardingHost /> : null}
    </div>
  );
}
```

- [ ] **Step 5: Çalıştır, geçtiğini gör**

Run: `npx vitest run __tests__/components/features/shell/claude-greeting.test.tsx __tests__/components/features/shell/guest-hint.test.tsx __tests__/components/features/home/home-chat-launcher.test.tsx`
Expected: PASS (mevcut launcher testi default varyantla aynı davranır).

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/components/features/shell src/components/features/home/home-chat-launcher.tsx src/routes/home.tsx
git add src/components/features/shell src/components/features/home/home-chat-launcher.tsx src/routes/home.tsx __tests__/components/features/shell
git commit -m "feat(shell): claude-style home — serif greeting, guest hint, trimmed launcher

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Composer kartı (hosted stil)

**Files:**
- Modify: `src/components/features/chat/components/chat-input-container.tsx`
- Modify: `src/components/features/chat/chat-send-button.tsx`
- Modify: `src/components/features/chat/chat-add-file-button.tsx:70-90`
- Test: `__tests__/components/features/shell/composer-hosted-style.test.tsx`

**Interfaces:**
- Hosted'da: kart `SHELL.composerCard + SHELL.composerPadding` (beyaz, rounded-2xl, kenarlık, gölge, focus-within koyu kenarlık); gönder `SHELL.sendButton` (kiremit, beyaz ok, boşken opacity-40, `aria-label = SHELL$SEND`); "+" `SHELL.addButton` (32px kenarlıklı). Local'de sınıflar aynen eski.

- [ ] **Step 1: Failing test**

`__tests__/components/features/shell/composer-hosted-style.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("#/api/agent-server-config", async () => {
  const actual = await vi.importActual<typeof import("#/api/agent-server-config")>("#/api/agent-server-config");
  return { ...actual, isHostedMode: () => true };
});
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));

import { ChatSendButton } from "#/components/features/chat/chat-send-button";

describe("composer in hosted (claude) mode", () => {
  it("renders the terracotta rounded send button with a white arrow", () => {
    render(<ChatSendButton buttonClassName="" handleSubmit={() => {}} disabled={false} />);
    const btn = screen.getByTestId("submit-button");
    expect(btn.className).toContain("bg-[var(--oh-accent)]");
    expect(btn.className).toContain("rounded-lg");
    expect(btn).toHaveAttribute("aria-label", "SHELL$SEND");
    expect(btn.querySelector("svg")?.getAttribute("color")).toBe("#ffffff");
  });

  it("keeps the disabled state visible but muted", () => {
    render(<ChatSendButton buttonClassName="" handleSubmit={() => {}} disabled />);
    const btn = screen.getByTestId("submit-button");
    expect(btn).toBeDisabled();
    expect(btn.className).toContain("disabled:opacity-40");
  });
});
```

- [ ] **Step 2: Çalıştır, başarısız gör**

Run: `npx vitest run __tests__/components/features/shell/composer-hosted-style.test.tsx`
Expected: FAIL — eski sınıflar (`rounded-full border-[#3D3929]`).

- [ ] **Step 3: Gönder düğmesi**

`src/components/features/chat/chat-send-button.tsx`:

```tsx
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

export function ChatSendButton({ buttonClassName, handleSubmit, disabled }: ChatSendButtonProps) {
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
              disabled ? "cursor-not-allowed border-[var(--oh-muted)]" : "cursor-pointer hover:bg-[#3D3929]/10",
            ),
        buttonClassName,
      )}
      data-name="arrow-up-circle-fill"
      data-testid="submit-button"
      aria-label={t(I18nKey.SHELL$SEND)}
      onClick={handleSubmit}
      disabled={disabled}
    >
      <ArrowUp className="w-4 h-4" color={claude ? "#ffffff" : disabled ? "var(--oh-muted)" : "#3D3929"} />
    </button>
  );
}
```

- [ ] **Step 4: Kart ve "+"**

`src/components/features/chat/components/chat-input-container.tsx` — `return` içindeki dış `div`:

```tsx
import { isHostedMode } from "#/api/agent-server-config";
import { SHELL } from "#/components/features/shell/shell-tokens";
// ...
  const claude = isHostedMode();
  return (
    <div
      ref={chatContainerRef}
      className={cn(
        claude
          ? cn(SHELL.composerCard, SHELL.composerPadding, "box-border flex w-full flex-col items-start justify-center relative")
          : "bg-[var(--oh-surface)] box-border content-stretch flex flex-col items-start justify-center p-4 relative rounded-[15px] w-full",
        conversationMode === "plan" && "border border-[#597FF4]",
      )}
```

`src/components/features/chat/chat-add-file-button.tsx` — düğme sınıfı:

```tsx
import { isHostedMode } from "#/api/agent-server-config";
import { SHELL } from "#/components/features/shell/shell-tokens";
// ...
  const claude = isHostedMode();
  // ...
      <button
        type="button"
        className={cn(
          claude ? SHELL.addButton : cn(chatInputIconButtonClassName, "relative shrink-0 size-6"),
          "relative shrink-0",
          disabled ? "cursor-not-allowed text-[var(--oh-text-subtle)]" : undefined,
          menuOpen && !disabled && (claude ? "bg-[var(--cool-grey-900)] text-content-2" : "text-content bg-[#3D3929]/10"),
        )}
        // ... (aria/props aynen)
      >
        <span className="flex h-full w-full items-center justify-center">
          <Plus className={claude ? "h-4 w-4 shrink-0" : "h-[13px] w-[13px] shrink-0"} strokeWidth={2} />
        </span>
      </button>
```

- [ ] **Step 5: Çalıştır**

Run: `npx vitest run __tests__/components/features/shell/composer-hosted-style.test.tsx __tests__/components/features/chat`
Expected: PASS — yeni test + mevcut chat testleri (local yol değişmedi; `aria-label` eklenmesi mevcut `getByTestId("submit-button")` sorgularını bozmaz).

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/components/features/chat
git add src/components/features/chat __tests__/components/features/shell
git commit -m "feat(shell): claude-style composer card, send and attach buttons in hosted mode

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Sohbet görünümü — 48rem kolon, claude turn'ları, üst çubuk, sağ panel

**Files:**
- Create: `src/components/features/shell/chat/claude-turn.tsx`
- Create: `src/components/features/shell/topbar/share-button.tsx`
- Modify: `src/components/features/chat/chat-message.tsx` (claude erken dönüş)
- Modify: `src/components/features/conversation/conversation-main/chat-interface-wrapper.tsx` (`THREAD_CLASSNAME`)
- Modify: `src/components/features/conversation/conversation-main/conversation-main.tsx` (header yüksekliği, panel yüzeyi)
- Modify: `src/components/features/conversation/conversation-name-with-status.tsx` (Paylaş düğmesi)
- Test: `__tests__/components/features/shell/claude-turn.test.tsx`

**Interfaces:**
- Produces: `ClaudeTurn({ type: "user" | "agent", message, actions?, isFromPlanningAgent?, children })` — kullanıcı: 28px baş harf avatarı + krem balon; asistan: 28px Corat mark + balonsuz `markdown-body` prose; hover'da altta aksiyon çubuğu (Kopyala + `actions`). `ShareButton()` — `useConversationNameContextMenu({ conversationId })`'nin `handleCopyShareLink`'ini çağırır, `shareUrl` yoksa devre dışı.
- `ChatMessage`: `isHostedMode() && pendingStatus == null` iken `ClaudeTurn` döner; pending/error yolları eski.

- [ ] **Step 1: Failing test**

`__tests__/components/features/shell/claude-turn.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("#/api/agent-server-config", async () => {
  const actual = await vi.importActual<typeof import("#/api/agent-server-config")>("#/api/agent-server-config");
  return { ...actual, isHostedMode: () => true };
});
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock("#/components/features/shell/sidebar/use-gateway-me", async () => {
  const actual = await vi.importActual<typeof import("#/components/features/shell/sidebar/use-gateway-me")>(
    "#/components/features/shell/sidebar/use-gateway-me",
  );
  return { ...actual, useGatewayMe: () => ({ status: "member", user: { name: "Sait" }, isGuest: false }) };
});

import { ChatMessage } from "#/components/features/chat/chat-message";

describe("ChatMessage in hosted (claude) mode", () => {
  it("renders a user turn as a full-width row with initial avatar and cream bubble", () => {
    render(<ChatMessage type="user" message="Merhaba" />);
    const turn = screen.getByTestId("user-message");
    expect(turn).toHaveAttribute("data-shell-turn", "user");
    expect(screen.getByTestId("shell-turn-avatar")).toHaveTextContent("S");
    expect(screen.getByTestId("shell-turn-body").className).toContain("bg-[var(--cool-grey-900)]");
    expect(turn).toHaveTextContent("Merhaba");
  });

  it("renders an agent turn without a bubble, with the brand mark and a hover action bar", async () => {
    const onAction = vi.fn();
    render(
      <ChatMessage type="agent" message="Selam!" actions={[{ icon: <span>R</span>, onClick: onAction, tooltip: "Retry" }]} />,
    );
    const turn = screen.getByTestId("agent-message");
    expect(turn).toHaveAttribute("data-shell-turn", "agent");
    expect(screen.getByTestId("shell-turn-body").className).not.toContain("bg-[var(--cool-grey-900)]");
    expect(screen.getByTestId("shell-turn-mark")).toBeInTheDocument();
    const bar = screen.getByTestId("shell-turn-actions");
    expect(bar.className).toContain("opacity-0");
    fireEvent.mouseEnter(turn);
    expect(bar.className).toContain("opacity-100");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onAction).toHaveBeenCalled();
  });

  it("keeps the legacy bubble for pending user messages", () => {
    render(<ChatMessage type="user" message="gönderiliyor" pendingStatus="sending" />);
    expect(screen.getByTestId("user-message")).not.toHaveAttribute("data-shell-turn");
  });
});
```

- [ ] **Step 2: Çalıştır, başarısız gör**

Run: `npx vitest run __tests__/components/features/shell/claude-turn.test.tsx`
Expected: FAIL — `data-shell-turn` yok.

- [ ] **Step 3: `ClaudeTurn`**

`src/components/features/shell/chat/claude-turn.tsx`:

```tsx
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
  actions?: Array<{ icon: React.ReactNode; onClick: () => void; tooltip?: string }>;
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
      className={cn("mt-6 flex w-full max-w-full gap-3 last:mb-4", isFromPlanningAgent && "rounded-2xl border border-[#597ff4] p-3")}
    >
      {type === "user" ? (
        <span data-testid="shell-turn-avatar" className={cn(SHELL.avatar, "mt-0.5")}>
          {initial}
        </span>
      ) : (
        <span data-testid="shell-turn-mark" className="mt-1 flex size-7 shrink-0 items-center justify-center">
          <CoratLogo width={26} height={14} aria-hidden />
        </span>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          data-testid="shell-turn-body"
          className={cn(
            "min-w-0 [word-break:break-word]",
            type === "user" ? cn(SHELL.userBubble, "w-fit max-w-full") : "markdown-body text-content-2",
            hasChildren && "flex flex-col gap-2",
          )}
        >
          <MarkdownRenderer
            includeStandard
            includeHeadings
            allowHtml={type !== "user"}
            components={type === "user" ? chatBubbleMarkdownComponents : undefined}
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
                <button type="button" aria-label={a.tooltip} onClick={a.onClick} className={SHELL.iconButton}>
                  {a.icon}
                </button>
              </StyledTooltip>
            ) : (
              <button key={i} type="button" aria-label={`Action ${i + 1}`} onClick={a.onClick} className={SHELL.iconButton}>
                {a.icon}
              </button>
            ),
          )}
        </div>
      </div>
    </article>
  );
}
```

`src/components/features/chat/chat-message.tsx` — `ChatMessage` gövdesinin EN BAŞINA (hook'lardan ÖNCE değil, `const { t } = ...` satırından ÖNCE değil — React kuralı: erken dönüş hook'lardan sonra olmalı; bu yüzden tüm `useState/useEffect/useLayoutEffect` tanımlarından hemen SONRA, `messageContent` hesaplanmadan ÖNCE):

```tsx
import { isHostedMode } from "#/api/agent-server-config";
import { ClaudeTurn } from "#/components/features/shell/chat/claude-turn";
// ...
  // Hosted (claude kabuğu): pending/hata dışındaki turlar claude düzeninde.
  if (isHostedMode() && pendingStatus == null && (type === "user" || type === "agent")) {
    return (
      <ClaudeTurn type={type} message={message} actions={actions} isFromPlanningAgent={isFromPlanningAgent}>
        {children}
      </ClaudeTurn>
    );
  }
```

- [ ] **Step 4: Kolon, üst çubuk, panel**

`chat-interface-wrapper.tsx`:

```tsx
import { isHostedMode } from "#/api/agent-server-config";
// ...
const THREAD_CLASSNAME = "w-full min-w-0 max-w-[800px] h-full flex flex-col min-h-0";
const THREAD_CLASSNAME_CLAUDE = "w-full min-w-0 max-w-[48rem] h-full flex flex-col min-h-0";
// ... render:
        <div className={isHostedMode() ? THREAD_CLASSNAME_CLAUDE : THREAD_CLASSNAME}>
```

`conversation-main.tsx`:

```tsx
import { isHostedMode } from "#/api/agent-server-config";
import { SHELL } from "#/components/features/shell/shell-tokens";
// ...
  const claude = isHostedMode();
  // chat-pane-header:
          <div
            data-testid="chat-pane-header"
            className={cn(
              "flex shrink-0 items-center",
              claude ? "h-12 min-h-12 px-3" : "h-10 min-h-10",
              isSidebarRailHidden && !claude && "gap-2 pl-2.5",
              isSidebarRailHidden && claude && "gap-2",
            )}
          >
  // sağ panel iç yüzeyi:
              <div className={cn(
                "flex flex-col flex-1 min-h-0 overflow-hidden",
                claude ? SHELL.panelSurface : "bg-[var(--oh-surface)] border-l border-[var(--oh-border)]",
              )}>
                <div
                  data-testid="tabs-pane-header"
                  className={cn("flex shrink-0 flex-col border-b border-[var(--oh-border-subtle)]", claude && "min-h-12")}
                >
```

`src/components/features/shell/topbar/share-button.tsx`:

```tsx
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
  const { handleCopyShareLink, shareUrl } = useConversationNameContextMenu({ conversationId });
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
```

`conversation-name-with-status.tsx` sağ grup:

```tsx
import { isHostedMode } from "#/api/agent-server-config";
import { ShareButton } from "#/components/features/shell/topbar/share-button";
// ...
      <div className="mr-2 flex shrink-0 items-center gap-1">
        {isHostedMode() ? <ShareButton /> : null}
        <ConversationGitActionsToggle />
        <ConversationOverviewToggle />
        <RightPanelToggle />
      </div>
```

- [ ] **Step 5: Çalıştır**

Run: `npx vitest run __tests__/components/features/shell/claude-turn.test.tsx __tests__/components/features/chat __tests__/components/features/conversation`
Expected: PASS (yeni + mevcut; local yol değişmedi). `useConversationNameContextMenu` başka props isterse (`executionStatus`) `useActiveConversation().data?.execution_status` geçir.

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/components/features/shell src/components/features/chat/chat-message.tsx src/components/features/conversation
git add src/components/features/shell src/components/features/chat/chat-message.tsx src/components/features/conversation __tests__/components/features/shell
git commit -m "feat(shell): claude-style chat turns, 48rem thread, share button and panel chrome

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Global CSS — scrollbar, context menu teması, hosted gizlemeler

**Files:**
- Modify: `src/tailwind.css` (`--oh-scrollbar*`, `.custom-scrollbar*` kuralları)
- Modify: `src/ui/context-menu.tsx` (`default`/`popover` tema sınıfları)
- Modify: `src/components/features/home/llm-not-configured-banner.tsx` (hosted → null)
- Test: `__tests__/components/features/shell/hosted-hides.test.tsx`

- [ ] **Step 1: Failing test**

`__tests__/components/features/shell/hosted-hides.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("#/api/agent-server-config", async () => {
  const actual = await vi.importActual<typeof import("#/api/agent-server-config")>("#/api/agent-server-config");
  return { ...actual, isHostedMode: () => true };
});
vi.mock("#/hooks/use-llm-configured", () => ({
  useLlmConfigured: () => ({ isConfigured: false, isLoading: false }),
}));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (k: string) => k }) }));
vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({ currentPath: "/", conversationId: null, isNavigating: false, navigate: vi.fn() }),
}));

import { LlmNotConfiguredBanner } from "#/components/features/home/llm-not-configured-banner";

describe("hosted mode hides local-only chrome", () => {
  it("does not render the LLM-not-configured banner", () => {
    const { container } = render(<LlmNotConfiguredBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
```

- [ ] **Step 2: Çalıştır, başarısız gör**

Run: `npx vitest run __tests__/components/features/shell/hosted-hides.test.tsx`
Expected: FAIL — banner render oluyor. (Banner'ın import ettiği başka hook'lar mock ister ise testteki `vi.mock` listesine ekle — hata mesajı hangi hook'un sağlayıcı istediğini söyler.)

- [ ] **Step 3: Banner**

`llm-not-configured-banner.tsx` bileşen gövdesinin başında (hook'lardan sonra, ilk `return null` koşulunun yanına):

```tsx
import { isHostedMode } from "#/api/agent-server-config";
// ...
  // Hosted: LLM kimliği gateway'den otomatik gelir; kullanıcıya LLM kurulumu gösterilmez.
  if (isHostedMode()) return null;
```

- [ ] **Step 4: Scrollbar**

`src/tailwind.css`:

```css
  --oh-scrollbar: var(--cool-grey-700);
  --oh-scrollbar-hover: var(--cool-grey-600);
```

`.custom-scrollbar` bloğunu şu hale getir (webkit + Firefox, 6px, saydam ray, hover'da koyulaşan kısa tutamaç):

```css
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: var(--oh-scrollbar) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--oh-scrollbar);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--oh-scrollbar-hover);
}
```

`.custom-scrollbar-always::-webkit-scrollbar-thumb` `border-radius: 3px` → `9999px`. Chat scroll konteynerine (`chat-interface.tsx` `data-testid="chat-scroll-container"` div) `[scrollbar-gutter:stable]` sınıfı ekle.

- [ ] **Step 5: Context menu teması**

`src/ui/context-menu.tsx` `theme.default` ve `theme.popover`:

```ts
        default:
          "absolute rounded-xl border border-[var(--oh-border)] bg-white p-1 shadow-[0_8px_24px_rgba(31,29,23,0.10)]",
        // ...
        popover:
          "relative rounded-xl border border-[var(--oh-border)] bg-white p-1 shadow-[0_8px_24px_rgba(31,29,23,0.10)]",
```

Bu global bir değişiklik (design language zaten 09-03'te globaldi); `__tests__/ui` altında sınıf adı assert eden test varsa (`grep -rn "bg-tertiary" __tests__/ui __tests__/components | grep -i "context-menu"`) beklentiyi güncelle.

- [ ] **Step 6: Çalıştır**

Run: `npx vitest run __tests__/components/features/shell/hosted-hides.test.tsx __tests__/ui __tests__/components/features/context-menu`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
npx prettier --write src/tailwind.css src/ui/context-menu.tsx src/components/features/home/llm-not-configured-banner.tsx src/components/features/chat/chat-interface.tsx
git add src/tailwind.css src/ui/context-menu.tsx src/components/features/home/llm-not-configured-banner.tsx src/components/features/chat/chat-interface.tsx __tests__
git commit -m "style(shell): claude-style scrollbars and menus; hide LLM banner in hosted mode

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Mock `/api/me`, ekran görüntüleri, lint, kapanış

**Files:**
- Create: `src/mocks/gateway-handlers.ts`
- Modify: `src/mocks/handlers.ts`
- Create: `scripts/shell-screenshots.mjs`
- Modify: `AGENTS.md` (kısa "Hosted shell" notu)

- [ ] **Step 1: MSW handler**

`src/mocks/gateway-handlers.ts`:

```ts
import { http, HttpResponse } from "msw";

/**
 * Gateway (corat-control-plane) uçları — sadece dev:mock / testler için.
 * `VITE_MOCK_GATEWAY_GUEST=true` ile misafir yanıtı verir.
 */
const guest = import.meta.env.VITE_MOCK_GATEWAY_GUEST === "true";

export const GATEWAY_HANDLERS = [
  http.get("/api/me", () =>
    HttpResponse.json(
      guest
        ? { user: { name: "Misafir", email: "guest@anonymous.placeholder.invalid", isAnonymous: true } }
        : { user: { name: "Sait Yasin", email: "sait@corat.ai", isAnonymous: false } },
    ),
  ),
  http.post("/api/auth/sign-out", () => HttpResponse.json({ success: true })),
];
```

`src/mocks/handlers.ts`: `import { GATEWAY_HANDLERS } from "./gateway-handlers";` ve `handlers` dizisine `...GATEWAY_HANDLERS` ekle (diğer `*_HANDLERS` yayılımlarının yanına).

- [ ] **Step 2: Ekran görüntüsü scripti**

`scripts/shell-screenshots.mjs`:

```js
// Kullanım: önce  npx cross-env VITE_HOSTED_MODE=true npm run dev:mock
// sonra   node scripts/shell-screenshots.mjs [outDir]
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.env.SHELL_BASE_URL ?? "http://localhost:3001";
const out = process.argv[2] ?? path.resolve("shell-screenshots");
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(`${base}/conversations`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(out, "01-home-expanded.png") });

await page.getByRole("button", { name: /collapse sidebar/i }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(out, "02-home-collapsed.png") });
await page.getByTestId("shell-sidebar").hover();
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, "03-sidebar-peek.png") });
await page.mouse.move(900, 450);
await page.getByRole("button", { name: /expand sidebar/i }).click();

const firstRecent = page.getByTestId("shell-recent-link").first();
if (await firstRecent.count()) {
  await firstRecent.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, "04-conversation.png") });
  await page.getByTestId("right-panel-toggle").click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, "05-conversation-panel.png") });
}

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${base}/conversations`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(out, "06-mobile-home.png") });

await browser.close();
console.log(`screenshots → ${out}`);
```

- [ ] **Step 3: Görsel kontrol**

Terminal 1: `npx cross-env VITE_HOSTED_MODE=true npm run dev:mock`
Terminal 2: `node scripts/shell-screenshots.mjs "%TEMP%\corat-shell-shots"` (PowerShell: `node scripts/shell-screenshots.mjs $env:TEMP\corat-shell-shots`)
Görüntüleri `Read` ile aç ve spec §4.2 tablosuyla karşılaştır: sidebar 288px/48px, satır 32px, selamlama serif 32px, composer beyaz kart rounded-2xl, kullanıcı balonu krem + avatar, asistan balonsuz, sağ panel beyaz. Sapmayı `shell-tokens.ts`'te düzelt, tekrar çek. Misafir görünümü için `VITE_MOCK_GATEWAY_GUEST=true` ekleyerek dev:mock'u yeniden başlat ve `01`'i tekrar çek (CTA + ipucu + "Bugün ne yapalım?").

- [ ] **Step 4: Lint + test**

Run: `npm run lint`
Expected: typecheck + eslint + prettier temiz.
Run: `npm test -- __tests__/components/features/shell __tests__/components/features/sidebar __tests__/components/features/home __tests__/components/features/chat __tests__/components/features/conversation`
Expected: PASS.

- [ ] **Step 5: AGENTS.md notu**

`AGENTS.md` "General" listesine:

```markdown
- **Hosted shell (Corat SaaS):** when `isHostedMode()` is true (`window.__AGENT_CANVAS_HOSTED_MODE__` from `static-server --hosted-mode`, or `VITE_HOSTED_MODE=true`), the app renders the claude.ai-style shell under `src/components/features/shell/` (sidebar, home greeting, composer/turn styling, share button). Identity comes from the gateway's `GET /api/me` (`useGatewayMe`); guests see Log in / Sign up. Measurements live in `shell-tokens.ts` only. Local mode keeps the Agent Canvas shell untouched. Dev: `npx cross-env VITE_HOSTED_MODE=true npm run dev:mock` (+ `VITE_MOCK_GATEWAY_GUEST=true` for the guest view); screenshots: `scripts/shell-screenshots.mjs`.
```

- [ ] **Step 6: Commit**

```bash
npx prettier --write src/mocks scripts/shell-screenshots.mjs
git add src/mocks scripts/shell-screenshots.mjs AGENTS.md
git commit -m "chore(shell): mock gateway identity, screenshot script, hosted shell notes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

- [ ] **Step 7: Canlı doğrulama (gateway ile)**

`corat-control-plane` planı (Task 1–6) uygulanmışsa: kontrol düzlemi `AGENT_CANVAS_HOSTED_MODE=true` ile çalışır, sandbox imajı bu fork'un yeni build'iyle güncellenir (README "hosted mode" bölümü — env yalnızca create'te verildiği için mevcut konteynerler kaldırılır). Gizli pencerede `/` → misafir kabuk (CTA, "Bugün ne yapalım?"); mesaj gönder → claude turn'ları; `/signup` → kayıt → aynı sohbetler, sidebar altında hesap kutusu.
