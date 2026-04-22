import { buildHudExport } from "@clocked/core";
import type { ProjectRecordClaim } from "@clocked/core";

export function createHudExport(input: {
  projectSlug: string;
  projectName: string;
  claims: ProjectRecordClaim[];
  baseUrl: string;
}) {
  return buildHudExport(input);
}

export function createPublicHudExport(input: {
  projectSlug: string;
  projectName: string;
  claims: ProjectRecordClaim[];
  baseUrl: string;
}) {
  return buildHudExport(input);
}
