import type {
  ActorPlatform,
  ActorRecord,
  CountsByStatus,
  ProjectRecord,
  ProjectRecordClaim
} from "@clocked/core";
import {
  countClaimsByStatus,
  dueSoonClaims,
  factualSummaryForCounts
} from "@clocked/core";

import { getAppBaseUrl } from "./env";

const now = new Date();
const daysFromNow = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

type DemoProject = ProjectRecord & { actors: ActorRecord[] };

const demoProjects: Record<string, DemoProject> = {
  "atlas-labs": {
    id: "sample-project-atlas",
    slug: "atlas-labs",
    name: "Atlas Labs",
    description:
      "Example project record showing how CLOCKED preserves source-linked delivery claims, deadlines, and reviewed outcomes.",
    website: "https://example.com/atlas",
    officialXHandle: "atlaslabs",
    officialTelegram: null,
    officialDiscord: null,
    gitHubOrg: "atlas-labs",
    gitBookUrl: null,
    heyAnonProjectKey: null,
    launchpadAgentId: null,
    createdAt: daysAgo(90),
    updatedAt: now,
    actors: []
  },
  "nova-chain": {
    id: "sample-project-nova",
    slug: "nova-chain",
    name: "NovaChain",
    description:
      "Example project record for public launch, testnet, and explorer delivery claims.",
    website: "https://example.com/nova",
    officialXHandle: "novachain",
    officialTelegram: null,
    officialDiscord: null,
    gitHubOrg: "nova-chain",
    gitBookUrl: null,
    heyAnonProjectKey: null,
    launchpadAgentId: null,
    createdAt: daysAgo(82),
    updatedAt: now,
    actors: []
  },
  "rift-protocol": {
    id: "sample-project-rift",
    slug: "rift-protocol",
    name: "Rift Protocol",
    description:
      "Example project record for SDK, integration, and roadmap delivery claims.",
    website: "https://example.com/rift",
    officialXHandle: "riftprotocol",
    officialTelegram: null,
    officialDiscord: "rift",
    gitHubOrg: "rift-protocol",
    gitBookUrl: null,
    heyAnonProjectKey: null,
    launchpadAgentId: null,
    createdAt: daysAgo(76),
    updatedAt: now,
    actors: []
  },
  "orbit-fi": {
    id: "sample-project-orbit",
    slug: "orbit-fi",
    name: "OrbitFi",
    description:
      "Example project record for vault, dashboard, and liquidity claim tracking.",
    website: "https://example.com/orbit",
    officialXHandle: "orbitfi",
    officialTelegram: null,
    officialDiscord: null,
    gitHubOrg: "orbit-fi",
    gitBookUrl: null,
    heyAnonProjectKey: null,
    launchpadAgentId: null,
    createdAt: daysAgo(64),
    updatedAt: now,
    actors: []
  },
  "haven-wallet": {
    id: "sample-project-haven",
    slug: "haven-wallet",
    name: "Haven Wallet",
    description:
      "Example project record for wallet release, policy, and security evidence claims.",
    website: "https://example.com/haven",
    officialXHandle: "havenwallet",
    officialTelegram: null,
    officialDiscord: null,
    gitHubOrg: "haven-wallet",
    gitBookUrl: null,
    heyAnonProjectKey: null,
    launchpadAgentId: null,
    createdAt: daysAgo(58),
    updatedAt: now,
    actors: []
  }
};

const demoActors: Record<string, ActorRecord> = {
  atlasfounder: {
    id: "sample-actor-atlasfounder",
    platform: "X",
    handle: "atlasfounder",
    displayName: "Atlas Labs founder",
    platformUserId: null,
    actorType: "FOUNDER",
    projectId: demoProjects["atlas-labs"]!.id,
    verifiedSource: true,
    createdAt: daysAgo(90),
    updatedAt: now
  },
  novalabs: {
    id: "sample-actor-novalabs",
    platform: "X",
    handle: "novalabs",
    displayName: "NovaChain labs",
    platformUserId: null,
    actorType: "OFFICIAL_PROJECT",
    projectId: demoProjects["nova-chain"]!.id,
    verifiedSource: true,
    createdAt: daysAgo(82),
    updatedAt: now
  },
  riftops: {
    id: "sample-actor-riftops",
    platform: "DISCORD",
    handle: "riftops",
    displayName: "Rift operations",
    platformUserId: null,
    actorType: "OFFICIAL_PROJECT",
    projectId: demoProjects["rift-protocol"]!.id,
    verifiedSource: true,
    createdAt: daysAgo(76),
    updatedAt: now
  },
  orbitdao: {
    id: "sample-actor-orbitdao",
    platform: "X",
    handle: "orbitdao",
    displayName: "OrbitFi DAO",
    platformUserId: null,
    actorType: "OFFICIAL_PROJECT",
    projectId: demoProjects["orbit-fi"]!.id,
    verifiedSource: true,
    createdAt: daysAgo(64),
    updatedAt: now
  },
  havensec: {
    id: "sample-actor-havensec",
    platform: "MANUAL",
    handle: "havensec",
    displayName: "Haven security team",
    platformUserId: null,
    actorType: "OFFICIAL_PROJECT",
    projectId: demoProjects["haven-wallet"]!.id,
    verifiedSource: true,
    createdAt: daysAgo(58),
    updatedAt: now
  }
};

for (const actor of Object.values(demoActors)) {
  const project = Object.values(demoProjects).find((item) => item.id === actor.projectId);
  project?.actors.push(actor);
}

function projectFor(slug: string): DemoProject {
  return demoProjects[slug] ?? demoProjects["atlas-labs"]!;
}

function actorFor(handle: string): ActorRecord {
  return demoActors[handle] ?? demoActors.atlasfounder!;
}

function demoClaim(input: {
  id: string;
  slug: string;
  projectSlug: string;
  actorHandle: string;
  status: ProjectRecordClaim["status"];
  claim: string;
  quote: string;
  deliverable: string;
  deadlineText: string;
  deadlineAt: Date;
  createdDaysAgo: number;
  sourcePlatform?: ActorPlatform;
  sourceUrl?: string;
  evidence?: string[];
  statusReason: string;
}): ProjectRecordClaim {
  const createdAt = daysAgo(input.createdDaysAgo);
  const project = projectFor(input.projectSlug);
  const actor = actorFor(input.actorHandle);
  const platform = input.sourcePlatform ?? actor.platform;

  return {
    id: input.id,
    publicSlug: input.slug,
    projectId: project.id,
    actorId: actor.id,
    sourcePostId: `${input.id}-source`,
    canonicalHash: `${input.id}-hash`,
    status: input.status,
    normalizedClaim: input.claim,
    sourceQuote: input.quote,
    deliverable: input.deliverable,
    deadlineText: input.deadlineText,
    deadlineAt: input.deadlineAt,
    deadlineTimezone: "UTC",
    deadlineConfidence: 0.88,
    extractionConfidence: 0.91,
    deliveryCriteriaJson: [
      "Public announcement or shipped artifact is visible from an official source.",
      "Evidence matches the recorded deliverable, not merely adjacent work.",
      "Evidence is reviewed before the receipt changes status."
    ],
    nonDeliveryCriteriaJson: [
      "Private messages, vague intent, or unverified community claims are not enough.",
      "A related update does not count unless it satisfies the recorded delivery criteria."
    ],
    ambiguityNotesJson: [],
    relatedClaimIdsJson: [],
    heyAnonContextJson: {
      note: "Example receipt shown for product preview."
    },
    createdAt,
    updatedAt: now,
    project,
    actor,
    sourcePost: {
      id: `${input.id}-source`,
      platform,
      url: input.sourceUrl ?? `https://x.com/${actor.handle}/status/${input.id}`,
      text: input.quote,
      postedAt: createdAt,
      capturedAt: createdAt,
      contentHash: `${input.id}-content`,
      sourceConfidence: 0.86
    },
    evidence: (input.evidence ?? []).map((summary, index) => ({
      id: `${input.id}-evidence-${index + 1}`,
      claimId: input.id,
      sourcePostId: `${input.id}-source`,
      evidenceType: index === 0 ? "SOURCE" : "FOLLOW_UP",
      url: `https://example.com/${project.slug}/evidence-${index + 1}`,
      summary,
      occurredAt: daysAgo(Math.max(input.createdDaysAgo - index - 1, 0)),
      confidence: 0.82,
      rawJson: null,
      createdAt: daysAgo(Math.max(input.createdDaysAgo - index - 1, 0))
    })),
    statusEvents: [
      {
        id: `${input.id}-status-created`,
        claimId: input.id,
        fromStatus: null,
        toStatus: "OPEN",
        reason: "Claim captured from a public source and queued for reviewed receipt publication.",
        evidenceJson: null,
        actorType: "SYSTEM",
        createdAt
      },
      {
        id: `${input.id}-status-current`,
        claimId: input.id,
        fromStatus: input.status === "OPEN" ? null : "OPEN",
        toStatus: input.status,
        reason: input.statusReason,
        evidenceJson: null,
        actorType: "ADMIN",
        createdAt: daysAgo(1)
      }
    ]
  };
}

export const demoClaims: ProjectRecordClaim[] = [
  demoClaim({
    id: "sample-claim-001",
    slug: "atlas-labs-mainnet-public-beta-by-april-30-2026",
    projectSlug: "atlas-labs",
    actorHandle: "atlasfounder",
    status: "OPEN",
    claim: "Atlas Labs will open mainnet public beta by 30 Apr 2026.",
    quote: "Public beta opens before the end of April. Receipts, docs, and status page will be public.",
    deliverable: "Public beta availability with official release notes.",
    deadlineText: "30 Apr 2026 23:59 UTC",
    deadlineAt: daysFromNow(4),
    createdDaysAgo: 12,
    evidence: ["Original roadmap post captured with a concrete public beta deadline."],
    statusReason: "The deadline is still active. No delivery assessment has been published yet."
  }),
  demoClaim({
    id: "sample-claim-002",
    slug: "nova-chain-testnet-explorer-by-may-3-2026",
    projectSlug: "nova-chain",
    actorHandle: "novalabs",
    status: "OPEN",
    claim: "NovaChain will ship a public testnet explorer by 3 May 2026.",
    quote: "Explorer is next. Public testnet search and account pages land by May 3.",
    deliverable: "Public testnet explorer with searchable accounts and transactions.",
    deadlineText: "3 May 2026 23:59 UTC",
    deadlineAt: daysFromNow(7),
    createdDaysAgo: 6,
    evidence: ["Public roadmap reply captured with explorer scope and date."],
    statusReason: "The deadline has not passed."
  }),
  demoClaim({
    id: "sample-claim-003",
    slug: "rift-protocol-sdk-v1-before-may-15-2026",
    projectSlug: "rift-protocol",
    actorHandle: "riftops",
    status: "OPEN",
    claim: "Rift Protocol will publish SDK v1 before 15 May 2026.",
    quote: "SDK v1 is scheduled before 15 May with docs and example integrations.",
    deliverable: "SDK v1 repository, docs, and integration examples.",
    deadlineText: "15 May 2026 23:59 UTC",
    deadlineAt: daysFromNow(19),
    createdDaysAgo: 8,
    sourcePlatform: "DISCORD",
    sourceUrl: "https://discord.com/channels/example/rift",
    evidence: ["Discord roadmap item captured with deadline and expected artifacts."],
    statusReason: "The deadline has not passed."
  }),
  demoClaim({
    id: "sample-claim-004",
    slug: "orbit-fi-vault-dashboard-by-april-28-2026",
    projectSlug: "orbit-fi",
    actorHandle: "orbitdao",
    status: "OPEN",
    claim: "OrbitFi will launch a public vault dashboard by 28 Apr 2026.",
    quote: "Vault dashboard goes public next week with deposits, caps, and strategy status.",
    deliverable: "Public vault dashboard showing deposits, caps, and strategy status.",
    deadlineText: "28 Apr 2026 23:59 UTC",
    deadlineAt: daysFromNow(2),
    createdDaysAgo: 5,
    evidence: ["Launch thread captured with dashboard scope and deadline window."],
    statusReason: "The deadline is approaching."
  }),
  demoClaim({
    id: "sample-claim-005",
    slug: "haven-wallet-security-policy-this-month",
    projectSlug: "haven-wallet",
    actorHandle: "havensec",
    status: "DELIVERED",
    claim: "Haven Wallet will publish its security policy this month.",
    quote: "Security policy, disclosure channel, and response windows will be public this month.",
    deliverable: "Public security policy with disclosure channel and response windows.",
    deadlineText: "April 2026",
    deadlineAt: daysFromNow(4),
    createdDaysAgo: 18,
    sourcePlatform: "MANUAL",
    sourceUrl: "https://example.com/haven/security-policy",
    evidence: [
      "Security policy page is public and linked from docs.",
      "Disclosure channel and response windows match the recorded claim."
    ],
    statusReason: "Reviewed public evidence indicates the promised policy is available."
  }),
  demoClaim({
    id: "sample-claim-006",
    slug: "nova-chain-faucet-rate-limits-published",
    projectSlug: "nova-chain",
    actorHandle: "novalabs",
    status: "DELIVERED",
    claim: "NovaChain will publish public faucet rate limits before the testnet wave.",
    quote: "Before the next testnet wave, faucet rate limits and queue rules will be public.",
    deliverable: "Public faucet rate limit and queue policy.",
    deadlineText: "Before next testnet wave",
    deadlineAt: daysAgo(3),
    createdDaysAgo: 14,
    evidence: ["Docs now include faucet rate limits and queue rules."],
    statusReason: "Reviewed docs match the recorded deliverable."
  }),
  demoClaim({
    id: "sample-claim-007",
    slug: "rift-protocol-integration-dashboard-march-deadline",
    projectSlug: "rift-protocol",
    actorHandle: "riftops",
    status: "SLIPPED",
    claim: "Rift Protocol will launch its integration dashboard by 31 Mar 2026.",
    quote: "The integration dashboard ships by the end of March with partner-level visibility.",
    deliverable: "Public integration dashboard.",
    deadlineText: "31 Mar 2026 23:59 UTC",
    deadlineAt: daysAgo(26),
    createdDaysAgo: 42,
    sourcePlatform: "DISCORD",
    sourceUrl: "https://discord.com/channels/example/rift",
    evidence: ["No reviewed public dashboard artifact was available at the deadline."],
    statusReason:
      "The recorded deadline passed before qualifying public delivery evidence was reviewed."
  }),
  demoClaim({
    id: "sample-claim-008",
    slug: "orbit-fi-governance-module-scope-update",
    projectSlug: "orbit-fi",
    actorHandle: "orbitdao",
    status: "REFRAMED",
    claim: "OrbitFi will ship the governance module in Q2 2026.",
    quote: "Governance module arrives in Q2, starting with proposal creation and vote tracking.",
    deliverable: "Governance proposal and vote tracking module.",
    deadlineText: "Q2 2026",
    deadlineAt: daysFromNow(66),
    evidence: ["Follow-up roadmap narrowed the Q2 scope to read-only vote tracking."],
    createdDaysAgo: 30,
    statusReason: "A reviewed follow-up changed the scope of the original claim."
  }),
  demoClaim({
    id: "sample-claim-009",
    slug: "haven-wallet-mobile-beta-next-week",
    projectSlug: "haven-wallet",
    actorHandle: "havensec",
    status: "AMBIGUOUS",
    claim: "Haven Wallet will open mobile beta next week.",
    quote: "Mobile beta opens next week if the final review passes.",
    deliverable: "Public mobile beta access or official beta invitation flow.",
    deadlineText: "Next week",
    deadlineAt: daysFromNow(8),
    sourcePlatform: "MANUAL",
    sourceUrl: "https://example.com/haven/mobile-beta",
    evidence: ["The source includes a condition that requires reviewer clarification."],
    createdDaysAgo: 3,
    statusReason: "The public wording is conditional, so the current receipt remains ambiguous."
  })
];

export function getDemoClaims(filters: {
  status?: string;
  projectSlug?: string;
  actorHandle?: string;
  query?: string;
  limit?: number;
}) {
  const normalizedQuery = filters.query?.trim().toLowerCase();
  const projectSlug =
    filters.projectSlug === "example-protocol" ? "atlas-labs" : filters.projectSlug;
  const actorHandle =
    filters.actorHandle === "examplefounder" ? "atlasfounder" : filters.actorHandle;

  return demoClaims
    .filter((claim) => (filters.status ? claim.status === filters.status : true))
    .filter((claim) => (projectSlug ? claim.project?.slug === projectSlug : true))
    .filter((claim) => (actorHandle ? claim.actor?.handle === actorHandle : true))
    .filter((claim) =>
      normalizedQuery
        ? [
            claim.normalizedClaim,
            claim.sourceQuote,
            claim.project?.name,
            claim.project?.slug,
            claim.actor?.handle,
            claim.publicSlug,
            claim.sourcePost.platform
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalizedQuery))
        : true
    )
    .slice(0, filters.limit ?? 50);
}

export function getDemoClaimBySlug(slug: string) {
  return demoClaims.find((claim) => claim.publicSlug === slug) ?? null;
}

export function getDemoProjectRecordBySlug(projectSlug: string) {
  const normalizedSlug = projectSlug === "example-protocol" ? "atlas-labs" : projectSlug;
  const project = demoProjects[normalizedSlug];

  if (!project) {
    return null;
  }

  const claims = getDemoClaims({ projectSlug: project.slug, limit: 200 });
  const counts = countClaimsByStatus(claims);
  const latestStatusChanges = claims
    .flatMap((claim) => claim.statusEvents)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return {
    project,
    countsByStatus: counts,
    dueSoon: dueSoonClaims(claims),
    openClaims: claims.filter((claim) => claim.status === "OPEN"),
    deliveredClaims: claims.filter((claim) => claim.status === "DELIVERED").slice(0, 6),
    slippedClaims: claims.filter((claim) => claim.status === "SLIPPED").slice(0, 6),
    reframedClaims: claims.filter((claim) => claim.status === "REFRAMED").slice(0, 6),
    latestClaims: claims.slice(0, 6),
    latestStatusChanges,
    publicUrl: `${getAppBaseUrl()}/p/${project.slug}`,
    factualSummary: factualSummaryForCounts(project.name, counts),
    claims
  };
}

export function getDemoActorRecordByHandle(platform: ActorPlatform, handle: string) {
  const normalizedHandle = handle === "examplefounder" ? "atlasfounder" : handle;
  const actor = demoActors[normalizedHandle];

  if (!actor || actor.platform !== platform) {
    return null;
  }

  const claims = getDemoClaims({ actorHandle: actor.handle, limit: 200 });
  const counts: CountsByStatus = countClaimsByStatus(claims);
  const project = Object.values(demoProjects).find((item) => item.id === actor.projectId);

  return {
    actor,
    associatedProjects: project ? [project] : [],
    countsByStatus: counts,
    latestStatusChanges: claims
      .flatMap((claim) => claim.statusEvents)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6),
    latestClaims: claims.slice(0, 8),
    publicUrl: `${getAppBaseUrl()}/a/${actor.platform}/${actor.handle}`,
    factualSummary: factualSummaryForCounts(actor.displayName ?? actor.handle, counts)
  };
}

export function getDemoDueBuckets() {
  const openClaims = getDemoClaims({ status: "OPEN", limit: 200 });
  const allClaims = getDemoClaims({ limit: 200 });
  const todayEnd = new Date(now);
  todayEnd.setUTCHours(23, 59, 59, 999);
  const weekEnd = daysFromNow(7);
  const counts = countClaimsByStatus(allClaims);

  return {
    today: openClaims.filter((claim) => claim.deadlineAt && claim.deadlineAt <= todayEnd),
    thisWeek: openClaims.filter(
      (claim) =>
        claim.deadlineAt &&
        claim.deadlineAt > todayEnd &&
        claim.deadlineAt <= weekEnd
    ),
    overdue: openClaims.filter((claim) => claim.deadlineAt && claim.deadlineAt < now),
    recentlyDelivered: allClaims.filter((claim) => claim.status === "DELIVERED").slice(0, 6),
    recentlyReframed: allClaims.filter((claim) => claim.status === "REFRAMED").slice(0, 6),
    digest: `Example receipts: ${openClaims.filter(
      (claim) =>
        claim.deadlineAt &&
        claim.deadlineAt >= now &&
        claim.deadlineAt <= weekEnd
    ).length} open claim(s) due soon, ${counts.DELIVERED} delivered, ${counts.SLIPPED} slipped, ${counts.REFRAMED} reframed.`
  };
}
