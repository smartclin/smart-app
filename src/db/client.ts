// import { readReplicas } from "@prisma/extension-read-replicas";
// import { PrismaClient } from "../generated/client/client.ts";

// With old rust engine

// const prisma = new PrismaClient({
//   //   datasourceUrl: process.env.COCKROACH_DB,
//   datasources: {
//     db: {
//       url: process.env.DATABASE_URL!,
//     },
//   },
//   omit: {
//     view: {
//       id: true,
//       title: true,
//     }
//   },
//   log: ["query", "info", "warn", "error"],
//   transactionOptions: {
//     isolationLevel: "ReadCommitted",
//     timeout: 10000,
//     maxWait: 10000,
//   },
//   errorFormat: "pretty",
// }).$extends(
//   readReplicas({
//     url: [
//       process.env.DATABASE_URL_REPLICA1!,
//       process.env.DATABASE_URL_REPLICA1!,
//     ],
//   })
// );

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/client/client.ts";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL!,
});

const client = new PrismaClient({
	adapter,
	log: ["query", "info", "warn", "error"],
	transactionOptions: {
		isolationLevel: "ReadCommitted",
		timeout: 10000,
		maxWait: 10000,
	},
	errorFormat: "pretty",
	// datasources: {
	//   db: {
	//     url: process.env.DATABASE_URL!,
	//   },
	// },
	// PrismaClientInitializationError: Custom datasource configuration is not compatible with Prisma Driver Adapters.
	omit: {
	},
});

// Export single instance
export const db = client
export default db
