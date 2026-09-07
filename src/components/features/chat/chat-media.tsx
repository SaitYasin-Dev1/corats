import React from "react";
import { cn } from "#/utils/utils";
import {
  joinWorkspaceUrl,
  useWorkspaceSession,
} from "#/hooks/query/use-workspace-session";

/**
 * Inline media rendering for chat markdown.
 *
 * Agent messages embed generated media with workspace-relative paths
 * (e.g. `![city](generated_media/img_….png)` or
 * `<video src="generated_media/video_….mp4" controls></video>` — see the
 * `corat-media-generation` skill). These components resolve such paths
 * against the conversation's static workspace fileserver
 * (`useWorkspaceSession` mints the cookie, `joinWorkspaceUrl` builds the
 * URL) so the browser can load them directly, while absolute http(s)
 * URLs pass through untouched.
 */

const ABSOLUTE_URL_REGEX = /^(?:https?:)?\/\//i;

/**
 * Resolve a markdown media `src` to a browser-loadable URL.
 *
 * - Absolute http(s) / protocol-relative URLs are returned as-is.
 * - Anything else is treated as a workspace-relative path and joined onto
 *   the static fileserver base URL (leading `./` and `/` stripped —
 *   `joinWorkspaceUrl` handles the slashes).
 * - Returns `null` while the workspace session hasn't been minted yet
 *   (or never will be, e.g. on cloud where the hook stays disabled).
 */
export function useResolvedMediaSrc(src: string | undefined | null): {
  url: string | null;
  isPending: boolean;
} {
  const { data: workspaceSession, isLoading } = useWorkspaceSession();

  if (!src) return { url: null, isPending: false };
  if (ABSOLUTE_URL_REGEX.test(src)) return { url: src, isPending: false };

  const relativePath = src.replace(/^\.\//, "");
  if (workspaceSession?.baseUrl) {
    return {
      url: joinWorkspaceUrl(workspaceSession.baseUrl, relativePath),
      isPending: false,
    };
  }

  return { url: null, isPending: isLoading };
}

const MEDIA_FRAME_CLASSES =
  "my-2 block max-h-[420px] max-w-full rounded-lg border border-[var(--oh-border)] object-contain";

function MediaPathFallback({ path }: { path: string }) {
  return (
    <code
      data-testid="chat-media-fallback"
      className="rounded bg-tertiary px-1.5 py-0.5 text-xs break-all"
    >
      {path}
    </code>
  );
}

export function ChatImage({
  src,
  alt,
  title,
  className,
}: React.ComponentProps<"img">) {
  const srcString = typeof src === "string" ? src : undefined;
  const { url, isPending } = useResolvedMediaSrc(srcString);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [url]);

  if (!url) {
    // Session still minting: reserve space instead of flashing broken UI.
    if (isPending) {
      return (
        <span
          data-testid="chat-media-loading"
          className={cn(MEDIA_FRAME_CLASSES, "h-40 w-64 animate-pulse")}
        />
      );
    }
    return <MediaPathFallback path={srcString ?? ""} />;
  }

  if (hasError) {
    return <MediaPathFallback path={srcString ?? url} />;
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img
        data-testid="chat-media-image"
        src={url}
        alt={alt ?? ""}
        title={title}
        loading="lazy"
        onError={() => setHasError(true)}
        className={cn(MEDIA_FRAME_CLASSES, "cursor-zoom-in", className)}
      />
    </a>
  );
}

export function ChatVideo({
  src,
  poster,
  children,
  className,
}: React.ComponentProps<"video">) {
  const srcString = typeof src === "string" ? src : undefined;
  const { url, isPending } = useResolvedMediaSrc(srcString);
  const { url: posterUrl } = useResolvedMediaSrc(poster);

  // A <video> may carry its src on nested <source> children instead; those
  // resolve through ChatSource, so only bail out when we have neither.
  const hasSourceChildren = React.Children.count(children) > 0;

  if (!url && !hasSourceChildren) {
    if (isPending) {
      return (
        <span
          data-testid="chat-media-loading"
          className={cn(MEDIA_FRAME_CLASSES, "h-40 w-64 animate-pulse")}
        />
      );
    }
    return <MediaPathFallback path={srcString ?? ""} />;
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption -- generated media has no caption track
    <video
      data-testid="chat-media-video"
      src={url ?? undefined}
      poster={posterUrl ?? undefined}
      controls
      playsInline
      preload="metadata"
      className={cn(MEDIA_FRAME_CLASSES, className)}
    >
      {children}
    </video>
  );
}

export function ChatSource({ src, type }: React.ComponentProps<"source">) {
  const srcString = typeof src === "string" ? src : undefined;
  const { url } = useResolvedMediaSrc(srcString);
  if (!url) return null;
  return <source src={url} type={type} />;
}
