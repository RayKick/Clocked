import slugify from "slugify";

function clean(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true }) || "item";
}

export function createClaimSlug(projectName: string, claim: string): string {
  return `${clean(projectName)}-${clean(claim).slice(0, 48)}`;
}

export function createProjectSlug(name: string): string {
  return clean(name);
}

export function createActorSlug(platform: string, handle: string): string {
  return `${clean(platform)}-${clean(handle)}`;
}

