import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();
export default Prisma;

// PGADMIN_DB_URL=postgresql://postgres:1234@localhost:5432/dripondrip

// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "../generated/prisma/index.js";

// const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const Prisma = new PrismaClient({ adapter });

// export default Prisma;
