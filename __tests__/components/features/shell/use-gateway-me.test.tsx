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
    mockFetchOnce(200, {
      user: { name: "Sait Yasin", email: "s@corat.ai", isAnonymous: false },
    });
    const { result } = renderHook(() => useGatewayMe());
    expect(result.current.status).toBe("loading");
    await waitFor(() => expect(result.current.status).toBe("member"));
    expect(result.current.isGuest).toBe(false);
    expect(result.current.user?.name).toBe("Sait Yasin");
  });

  it("resolves a guest when the gateway says isAnonymous", async () => {
    mockFetchOnce(200, {
      user: {
        name: "Misafir",
        email: "x@anonymous.placeholder.invalid",
        isAnonymous: true,
      },
    });
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
