import { and, desc, eq, like } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../db";
import { service } from "../../db/schema";
import { protectedProcedure } from "../init";

export const listServices = protectedProcedure
	.input(
		z.object({
			search: z.string().optional(),
			category: z.string().optional(),
			page: z.number().int().min(1).default(1),
			pageSize: z.number().int().min(1).max(100).default(50)
		})
	)
	.output(
		z.object({
			services: z.array(z.any()),
			total: z.number(),
			page: z.number(),
			totalPages: z.number()
		})
	)
	.handler(async ({ input, context }) => {
		const { search, category, page, pageSize } = input;
		const clinicId = context.clinicId;

		const conditions = and(
			eq(service.isDeleted, false),
			clinicId ? eq(service.clinicId, clinicId) : undefined,
			category ? eq(service.category, category) : undefined,
			search ? like(service.serviceName, `%${search}%`) : undefined
		);

		const services = await db.query.service.findMany({
			where: conditions,
			limit: pageSize,
			offset: (page - 1) * pageSize,
			orderBy: desc(service.createdAt)
		});

		const total = await db.$count(service, conditions);

		return {
			services,
			total,
			page,
			totalPages: Math.ceil(total / pageSize)
		};
	});

export const getService = protectedProcedure
	.input(z.object({ id: z.string() }))
	.output(z.any())
	.handler(async ({ input }) => {
		const found = await db.query.service.findFirst({
			where: and(eq(service.id, input.id), eq(service.isDeleted, false))
		});
		if (!found) throw new Error("Service not found");
		return found;
	});
