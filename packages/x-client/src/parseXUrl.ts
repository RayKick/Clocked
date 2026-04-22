export interface ParsedXUrl {
  platform: "X";
  handle: string;
  postId: string;
  canonicalUrl: string;
}

const SUPPORTED_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com"
]);

export function parseXUrl(input: string): ParsedXUrl {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Invalid X URL.");
  }

  if (!SUPPORTED_HOSTS.has(url.hostname.toLowerCase())) {
    throw new Error("Unsupported X URL host.");
  }

  const parts = url.pathname.split("/").filter(Boolean);
  const statusIndex = parts.indexOf("status");
  if (statusIndex !== 1) {
    throw new Error("X URL must include /{handle}/status/{id}.");
  }

  const handle = parts[0]?.replace(/^@/, "");
  const postId = parts[2];

  if (!handle) {
    throw new Error("X URL is missing a handle.");
  }

  if (!postId) {
    throw new Error("X URL is missing a status ID.");
  }

  if (!/^\d+$/.test(postId)) {
    throw new Error("X status ID must be numeric.");
  }

  return {
    platform: "X",
    handle,
    postId,
    canonicalUrl: `https://x.com/${handle}/status/${postId}`
  };
}
