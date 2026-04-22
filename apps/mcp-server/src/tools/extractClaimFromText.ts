import { extractClaim } from "@clocked/ai";
import { z } from "zod";

export const extractClaimFromTextInputSchema = z.object({
  text: z.string().min(1),
  sourcePostedAt: z.string().datetime().optional(),
  sourceAuthorHandle: z.string().optional(),
  projectName: z.string().optional()
});

export async function extractClaimFromTextTool(input: unknown) {
  return extractClaim(extractClaimFromTextInputSchema.parse(input), { mode: "mock" });
}

