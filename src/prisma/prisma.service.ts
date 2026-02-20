import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';

function getReplicaUrls(): string[] {
  const urls = [
    process.env.DATABASE_URL_REPLICA_1,
    process.env.DATABASE_URL_REPLICA_2,
    process.env.DATABASE_URL_REPLICA_3,
  ].filter((u): u is string => Boolean(u?.trim()));
  return urls;
}

function createPrismaClient(): PrismaClient {
  const replicaUrls = getReplicaUrls();
  if (replicaUrls.length === 0) {
    return new PrismaClient();
  }
  return new PrismaClient().$extends(
    readReplicas({
      url: replicaUrls,
    }),
  ) as unknown as PrismaClient;
}

type ExtendedPrisma = ReturnType<typeof createPrismaClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: ExtendedPrisma;

  constructor() {
    this.client = createPrismaClient();
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  get user() {
    return this.client.user;
  }

  get $primary() {
    const ext = this.client as ExtendedPrisma & { $primary?: () => PrismaClient };
    return ext.$primary?.() ?? this.client;
  }

  get $replica() {
    return (this.client as ExtendedPrisma & { $replica?: () => unknown }).$replica;
  }

  $transaction(arg: unknown, options?: unknown): Promise<unknown> {
    return (this.client.$transaction as (arg: unknown, options?: unknown) => Promise<unknown>)(arg, options);
  }

  $connect() {
    return this.client.$connect();
  }

  $disconnect() {
    return this.client.$disconnect();
  }
}
