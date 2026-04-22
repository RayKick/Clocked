import { getClaimTool } from "../tools/getClaim";

export async function claimResource(slug: string) {
  return getClaimTool({ slug });
}

