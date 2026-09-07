import { SkillsClient } from "@openhands/typescript-client/clients";
import {
  SKILLS_CATALOG,
  type SkillCatalogEntry,
} from "@openhands/extensions/skills";
import { SkillInfo } from "#/types/settings";
import { CORAT_BUNDLED_SKILLS } from "./corat-skills";
import { getAgentServerWorkingDir } from "./agent-server-config";
import { getActiveBackend } from "./backend-registry/active-store";
import { fetchCloudSkills } from "./cloud/skills-service.api";
import { getAgentServerClientOptions } from "./agent-server-client-options";

function catalogEntryToSkillInfo(entry: SkillCatalogEntry): SkillInfo {
  return {
    name: entry.name,
    type: "knowledge",
    source: "public",
    description: entry.description,
    triggers: entry.triggers,
    category: entry.category,
    content: entry.content,
    license: entry.license ?? null,
    compatibility: entry.compatibility ?? null,
  };
}

/**
 * Public skills loaded from the `@openhands/extensions` npm package.
 *
 * This is an **immutable build-time snapshot**: the catalog is baked into the
 * bundle at `npm run build` / `vite build` time and does not change at
 * runtime. Updating the catalog requires bumping the `@openhands/extensions`
 * dependency and rebuilding.
 */
const PUBLIC_SKILLS: SkillInfo[] = SKILLS_CATALOG.map(catalogEntryToSkillInfo);

/**
 * Corat built-in skills, surfaced in the skills list so users can inspect
 * and toggle them. They are injected into `agent_context.skills` by
 * `buildAgentContext` (see corat-skills.ts) independently of this listing.
 */
const CORAT_SKILLS: SkillInfo[] = CORAT_BUNDLED_SKILLS.map((skill) => ({
  name: skill.name,
  type: "knowledge",
  source: "public",
  description: skill.description ?? "",
  triggers: skill.trigger?.keywords ?? [],
  category: "integrations",
  content: skill.content,
  license: null,
  compatibility: null,
}));

class SkillsService {
  static async getSkills(projectDir?: string): Promise<SkillInfo[]> {
    if (getActiveBackend().backend.kind === "cloud") {
      return fetchCloudSkills();
    }

    // Public skills come from the bundled @openhands/extensions npm package —
    // no agent-server round-trip or GitHub fetch needed. Only ask the agent-
    // server for user and project skills so local .agents/skills/ content is
    // still picked up.
    let localSkills: SkillInfo[] = [];
    try {
      const response = await new SkillsClient(
        getAgentServerClientOptions(),
      ).getSkills({
        load_public: false,
        load_user: true,
        load_project: true,
        load_org: false,
        project_dir: projectDir ?? getAgentServerWorkingDir(),
      });
      localSkills = (response.skills ?? []) as SkillInfo[];
    } catch {
      // Agent-server may not support the skills endpoint or may be
      // unreachable; fall back to the bundled public catalog alone.
    }

    return [...localSkills, ...CORAT_SKILLS, ...PUBLIC_SKILLS];
  }
}

export default SkillsService;
