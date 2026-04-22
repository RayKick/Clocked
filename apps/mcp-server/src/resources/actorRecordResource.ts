import { getActorRecordTool } from "../tools/getActorRecord";

export async function actorRecordResource(platform: string, handle: string) {
  return getActorRecordTool({ platform, handle });
}

