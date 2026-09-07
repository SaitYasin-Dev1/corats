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
        if (!controller.signal.aborted)
          setState({ status: "unavailable", user: null });
      });
    return () => controller.abort();
  }, []);

  return { ...state, isGuest: state.status !== "member" };
}

const defaultNavigate = (href: string) => {
  window.location.href = href;
};

/** `go` testte enjekte edilir; üründe tam sayfa yönlendirme. */
export async function signOutFromGateway(
  go: (href: string) => void = defaultNavigate,
): Promise<void> {
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
