/**
 * Corat-specific bundled skills injected into every conversation's
 * `agent_context.skills` alongside the public `@openhands/extensions`
 * catalog (see `buildAgentContext` in agent-server-adapter.ts).
 *
 * These are NOT catalog skills (`isCatalogSkill()` is false for them), so
 * the enablement filter keeps them on by default; users can still turn one
 * off via the persisted `disabled_skills` deny-list.
 */

/**
 * Mirrors the SDK `Skill` JSON shape used by `BundledSkill` in
 * agent-server-adapter.ts: keyword triggers drive activation, `content` is
 * injected into the system prompt when a trigger matches.
 */
export interface CoratBundledSkill {
  name: string;
  content: string;
  trigger: { type: "keyword"; keywords: string[] } | null;
  source: string;
  description: string | null;
  is_agentskills_format: true;
}

const MEDIA_GENERATION_SKILL_CONTENT = `# Media Generation & In-Chat Display

You can generate images and videos with external AI APIs and display them
inline in the chat. Follow this workflow whenever the user asks for an
image, picture, photo, illustration, logo, banner, or video.

## 1. Pick a provider from available API keys

Check which keys exist (never print their values):

\`\`\`bash
python3 -c "import os; print({k: bool(os.environ.get(k)) for k in ['OPENAI_API_KEY','REPLICATE_API_TOKEN','GEMINI_API_KEY','LUMAAI_API_KEY','RUNWAYML_API_SECRET','STABILITY_API_KEY']})"
\`\`\`

Preference order:

- **Images:** \`OPENAI_API_KEY\` (model \`gpt-image-1\`, fall back to
  \`dall-e-3\`) → \`REPLICATE_API_TOKEN\` (\`black-forest-labs/flux-schnell\`
  or \`flux-1.1-pro\`) → \`GEMINI_API_KEY\` (Imagen via
  \`google-genai\`) → \`STABILITY_API_KEY\`.
- **Videos:** \`REPLICATE_API_TOKEN\` (e.g. \`wan-video/wan-2.2-t2v-fast\`,
  \`kwaivgi/kling-v2.1\`) → \`LUMAAI_API_KEY\` (Dream Machine) →
  \`RUNWAYML_API_SECRET\` (Gen-3/Gen-4).

If no suitable key exists, do NOT fabricate media. Tell the user exactly
which environment variable to set (e.g. \`OPENAI_API_KEY\`) and stop.

## 2. Engineer the prompt

Translate the user's request (any language) into one detailed English
prompt: subject, style, lighting, camera/composition, mood, quality tags
(e.g. "highly detailed, 4k"). For video also describe motion and duration.
Show the user the final prompt you used.

## 3. Generate via a Python script

- Install the provider SDK only if missing (\`pip install openai\`,
  \`pip install replicate\`, ...).
- Write the script into the workspace and read keys ONLY from
  \`os.environ\` — never hardcode or echo a key, and never commit one.
- Save output under \`generated_media/\` at the **workspace root** with a
  unique timestamped name, e.g.
  \`generated_media/img_20260903_141530.png\` or
  \`generated_media/video_20260903_141530.mp4\`. Create the directory if
  needed. If the API returns a URL, download it to that path.
- For video prefer **MP4 (H.264)**; for images PNG/JPEG/WebP.

## 4. Verify before showing

Confirm the file exists and is non-empty (\`os.path.getsize(...) > 0\`).
On failure, retry once; if it still fails, switch to the next available
provider. Report real errors honestly — never claim success without the
file on disk.

## 5. Display it inline in the chat (REQUIRED)

In your **final chat message**, embed the media with a path **relative to
the workspace root** — no leading slash, no \`file://\`, no absolute paths:

- Image: \`![Cyberpunk city in rain](generated_media/img_20260903_141530.png)\`
- Video (raw HTML is allowed in agent messages):

  \`\`\`
  <video src="generated_media/video_20260903_141530.mp4" controls></video>
  \`\`\`

The chat UI resolves these workspace-relative paths through the
conversation's file server and renders them inline. A bare URL or an
absolute path will NOT render — always use the relative form above. Also
mention the saved file path in plain text so the user can find it later.
`;

export const CORAT_BUNDLED_SKILLS: CoratBundledSkill[] = [
  {
    name: "corat-media-generation",
    content: MEDIA_GENERATION_SKILL_CONTENT,
    trigger: {
      type: "keyword",
      keywords: [
        "görsel",
        "resim",
        "fotoğraf",
        "fotograf",
        "image",
        "picture",
        "photo",
        "video",
        "animasyon",
        "animation",
        "illustration",
        "illüstrasyon",
        "logo",
        "banner",
        "thumbnail",
        "dall-e",
        "midjourney",
        "stable diffusion",
        "flux",
      ],
    },
    source: "corat-builtin",
    description:
      "Generate images and videos with AI APIs (OpenAI, Replicate, Luma, Runway, Gemini) and display them inline in the chat.",
    is_agentskills_format: true,
  },
];
