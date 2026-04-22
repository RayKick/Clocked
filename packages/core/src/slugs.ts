import slugify from "slugify";

function clean(input: string): string {
  return slugify(input, { lower: true, strict: true, trim: true }) || "item";
}

function normalizeClaimTextForSlug(projectName: string, claim: string): string {
  const escapedProjectName = projectName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return claim
    .replace(new RegExp(`^${escapedProjectName}\\s+`, "i"), "")
    .replace(/\b(the|a|an)\b/gi, " ")
    .replace(/\bby\s+by\b/gi, "by ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createClaimSlug(projectName: string, claim: string): string {
  const projectSlug = clean(projectName);
  const claimSlug = clean(normalizeClaimTextForSlug(projectName, claim))
    .replace(/\bby-by\b/g, "by")
    .replace(/^-+|-+$/g, "");

  return `${projectSlug}-${claimSlug.slice(0, 48)}`.replace(/-+/g, "-").replace(/-$/, "");
}

export function createProjectSlug(name: string): string {
  return clean(name);
}

export function createActorSlug(platform: string, handle: string): string {
  return `${clean(platform)}-${clean(handle)}`;
}
