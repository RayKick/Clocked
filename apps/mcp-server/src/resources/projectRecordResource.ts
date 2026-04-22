import { getProjectRecordTool } from "../tools/getProjectRecord";

export async function projectRecordResource(slug: string) {
  return getProjectRecordTool({ projectSlug: slug });
}

