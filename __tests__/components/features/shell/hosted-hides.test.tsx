import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("#/api/agent-server-config", async () => {
  const actual = await vi.importActual<
    typeof import("#/api/agent-server-config")
  >("#/api/agent-server-config");
  return { ...actual, isHostedMode: () => true };
});
vi.mock("#/hooks/use-llm-configured", () => ({
  useLlmConfigured: () => ({ isConfigured: false, isLoading: false }),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
vi.mock("#/context/navigation-context", () => ({
  useNavigation: () => ({
    currentPath: "/",
    conversationId: null,
    isNavigating: false,
    navigate: vi.fn(),
  }),
}));

import { LlmNotConfiguredBanner } from "#/components/features/home/llm-not-configured-banner";

describe("hosted mode hides local-only chrome", () => {
  it("does not render the LLM-not-configured banner", () => {
    const { container } = render(<LlmNotConfiguredBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
