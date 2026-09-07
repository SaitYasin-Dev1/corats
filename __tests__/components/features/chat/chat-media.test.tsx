import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  ChatImage,
  ChatVideo,
} from "#/components/features/chat/chat-media";
import { useWorkspaceSession } from "#/hooks/query/use-workspace-session";

vi.mock("#/hooks/query/use-workspace-session", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("#/hooks/query/use-workspace-session")
    >();
  return {
    ...actual,
    useWorkspaceSession: vi.fn(),
  };
});

const mockUseWorkspaceSession = vi.mocked(useWorkspaceSession);

const SESSION_READY = {
  data: {
    baseUrl: "http://127.0.0.1:18000/api/conversations/abc/workspace/",
  },
  isLoading: false,
  isError: false,
  error: null,
};

const SESSION_PENDING = {
  data: null,
  isLoading: true,
  isError: false,
  error: null,
};

const SESSION_UNAVAILABLE = {
  data: null,
  isLoading: false,
  isError: false,
  error: null,
};

describe("ChatImage", () => {
  beforeEach(() => {
    mockUseWorkspaceSession.mockReturnValue(SESSION_READY);
  });

  it("resolves a workspace-relative src against the fileserver base URL", () => {
    render(<ChatImage src="generated_media/img_001.png" alt="city" />);
    const img = screen.getByTestId("chat-media-image");
    expect(img.getAttribute("src")).toBe(
      "http://127.0.0.1:18000/api/conversations/abc/workspace/generated_media/img_001.png",
    );
  });

  it("strips a leading ./ before resolving", () => {
    render(<ChatImage src="./generated_media/img_001.png" alt="city" />);
    const img = screen.getByTestId("chat-media-image");
    expect(img.getAttribute("src")).toBe(
      "http://127.0.0.1:18000/api/conversations/abc/workspace/generated_media/img_001.png",
    );
  });

  it("passes absolute http(s) URLs through untouched", () => {
    render(<ChatImage src="https://example.com/pic.png" alt="pic" />);
    const img = screen.getByTestId("chat-media-image");
    expect(img.getAttribute("src")).toBe("https://example.com/pic.png");
  });

  it("shows a placeholder while the workspace session is minting", () => {
    mockUseWorkspaceSession.mockReturnValue(SESSION_PENDING);
    render(<ChatImage src="generated_media/img_001.png" alt="city" />);
    expect(screen.getByTestId("chat-media-loading")).not.toBeNull();
  });

  it("falls back to the path text when no session is available (e.g. cloud)", () => {
    mockUseWorkspaceSession.mockReturnValue(SESSION_UNAVAILABLE);
    render(<ChatImage src="generated_media/img_001.png" alt="city" />);
    const fallback = screen.getByTestId("chat-media-fallback");
    expect(fallback.textContent).toBe("generated_media/img_001.png");
  });
});

describe("ChatVideo", () => {
  beforeEach(() => {
    mockUseWorkspaceSession.mockReturnValue(SESSION_READY);
  });

  it("resolves a workspace-relative src and keeps controls on", () => {
    render(<ChatVideo src="generated_media/video_001.mp4" />);
    const video = screen.getByTestId("chat-media-video");
    expect(video.getAttribute("src")).toBe(
      "http://127.0.0.1:18000/api/conversations/abc/workspace/generated_media/video_001.mp4",
    );
    expect(video.hasAttribute("controls")).toBe(true);
  });

  it("falls back to the path text when no session is available", () => {
    mockUseWorkspaceSession.mockReturnValue(SESSION_UNAVAILABLE);
    render(<ChatVideo src="generated_media/video_001.mp4" />);
    const fallback = screen.getByTestId("chat-media-fallback");
    expect(fallback.textContent).toBe("generated_media/video_001.mp4");
  });
});
