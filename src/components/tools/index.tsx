import { ChecklistTool } from "@/components/tools/ChecklistTool";
import { SkillMapTool } from "@/components/tools/SkillMapTool";
import { SkillsLibraryTool } from "@/components/tools/SkillsLibraryTool";
import { RtkGuideTool } from "@/components/tools/RtkGuideTool";
import { AgentSkillsTool } from "@/components/tools/AgentSkillsTool";
import { CheatsheetsTool } from "@/components/tools/CheatsheetsTool";

export function hasTool(toolKey: string | null): boolean {
  return (
    toolKey === "checklist-30" ||
    toolKey === "skill-map" ||
    toolKey === "skills-library" ||
    toolKey === "rtk-guide" ||
    toolKey === "agent-skills" ||
    toolKey === "cheatsheets"
  );
}

export function renderTool(toolKey: string | null) {
  switch (toolKey) {
    case "checklist-30":
      return <ChecklistTool />;
    case "skill-map":
      return <SkillMapTool />;
    case "skills-library":
      return <SkillsLibraryTool />;
    case "rtk-guide":
      return <RtkGuideTool />;
    case "agent-skills":
      return <AgentSkillsTool />;
    case "cheatsheets":
      return <CheatsheetsTool />;
    default:
      return null;
  }
}
