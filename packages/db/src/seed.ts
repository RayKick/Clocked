import "dotenv/config";

import { ActorType, Platform } from "./generated/client/index";
import { prisma } from "./client";

async function main() {
  const project = await prisma.project.upsert({
    where: { slug: "example-protocol" },
    update: {
      name: "Example Protocol",
      description: "Example Protocol is a local CLOCKED demo project for dry-run verification.",
      officialXHandle: "exampleprotocol",
      website: "https://exampleprotocol.local"
    },
    create: {
      slug: "example-protocol",
      name: "Example Protocol",
      description: "Example Protocol is a local CLOCKED demo project for dry-run verification.",
      officialXHandle: "exampleprotocol",
      website: "https://exampleprotocol.local"
    }
  });

  const founder = await prisma.actor.upsert({
    where: {
      platform_handle: {
        platform: Platform.X,
        handle: "examplefounder"
      }
    },
    update: {
      displayName: "Example Founder",
      actorType: ActorType.FOUNDER,
      verifiedSource: true,
      projectId: project.id
    },
    create: {
      platform: Platform.X,
      handle: "examplefounder",
      displayName: "Example Founder",
      actorType: ActorType.FOUNDER,
      verifiedSource: true,
      projectId: project.id
    }
  });

  const projectActor = await prisma.actor.upsert({
    where: {
      platform_handle: {
        platform: Platform.X,
        handle: "exampleprotocol"
      }
    },
    update: {
      displayName: "Example Protocol",
      actorType: ActorType.OFFICIAL_PROJECT,
      verifiedSource: true,
      projectId: project.id
    },
    create: {
      platform: Platform.X,
      handle: "exampleprotocol",
      displayName: "Example Protocol",
      actorType: ActorType.OFFICIAL_PROJECT,
      verifiedSource: true,
      projectId: project.id
    }
  });

  console.log({
    ok: true,
    project: { id: project.id, slug: project.slug, name: project.name },
    actors: [
      { id: founder.id, handle: founder.handle, actorType: founder.actorType },
      { id: projectActor.id, handle: projectActor.handle, actorType: projectActor.actorType }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
