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
        ? {
            user: {
              name: "Misafir",
              email: "guest@anonymous.placeholder.invalid",
              isAnonymous: true,
            },
          }
        : {
            user: {
              name: "Sait Yasin",
              email: "sait@corat.ai",
              isAnonymous: false,
            },
          },
    ),
  ),
  http.post("/api/auth/sign-out", () => HttpResponse.json({ success: true })),
];
