// PGADMIN_DB_URL=postgresql://postgres:1234@localhost:5432/dripondrip

import { PrismaClient } from "../generated/prisma/index.js";

const Prisma = new PrismaClient();

export default Prisma;
