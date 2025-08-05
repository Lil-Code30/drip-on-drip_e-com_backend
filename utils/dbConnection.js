import { PrismaClient } from "../generated/prisma/index.js";

const globalForPrisma = globalThis;

const Prisma = globalForPrisma.Prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.Prisma = Prisma;

export default Prisma;

// PGADMIN_DB_URL=postgresql://postgres:1234@localhost:5432/dripondrip

// import { PrismaClient } from "../generated/prisma/index.js";
// import { withAccelerate } from "@prisma/extension-accelerate";

// const Prisma = new PrismaClient().$extends(withAccelerate());
// export default Prisma;

// import { PrismaClient } from "../generated/prisma/index.js";

// const Prisma = new PrismaClient();

// export default Prisma;
