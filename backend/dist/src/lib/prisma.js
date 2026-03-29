"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const globalForPrisma = globalThis;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set.');
}
const pool = globalForPrisma.prismaPool ??
    new pg_1.Pool({
        connectionString: databaseUrl,
    });
const adapter = new adapter_pg_1.PrismaPg(pool);
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = exports.prisma;
    globalForPrisma.prismaPool = pool;
}
