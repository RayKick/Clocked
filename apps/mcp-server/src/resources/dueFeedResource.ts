import { getDueClaimsTool } from "../tools/getDueClaims";

export async function dueFeedResource() {
  return getDueClaimsTool({ timeframe: "this_week" });
}

