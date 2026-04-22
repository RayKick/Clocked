import { PrismaClient } from "./generated/client/index";

declare global {
  // eslint-disable-next-line no-var
  var __clockedPrisma__: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

export const prisma =
  globalThis.__clockedPrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__clockedPrisma__ = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
