import { PrefetchPageLinks, useLocation } from "react-router";
import { isHostedMode } from "#/api/agent-server-config";
import { HomeChatLauncher } from "#/components/features/home/home-chat-launcher";
import { LlmNotConfiguredBanner } from "#/components/features/home/llm-not-configured-banner";
import {
  isOnboardingPreviewActive,
  OnboardingHost,
} from "#/components/features/onboarding";

<PrefetchPageLinks page="/conversations/:conversationId" />;

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

export default HomeScreen;
