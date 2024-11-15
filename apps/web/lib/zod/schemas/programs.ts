import { intervals } from "@/lib/analytics/constants";
import {
  CommissionInterval,
  CommissionType,
  ProgramType,
} from "@prisma/client";
import { z } from "zod";
import { parseDateSchema } from "./utils";

export const ProgramSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  type: z.nativeEnum(ProgramType),
  cookieLength: z.number(),
  commissionAmount: z.number(),
  commissionType: z.nativeEnum(CommissionType),
  recurringCommission: z.boolean(),
  recurringDuration: z.number().nullable(),
  recurringInterval: z.nativeEnum(CommissionInterval).nullable(),
  isLifetimeRecurring: z.boolean().nullable(),
  defaultDomain: z.string().nullable(),
  destinationUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProgramSchema = z.object({
  name: z.string(),
  commissionType: z.nativeEnum(CommissionType),
  commissionAmount: z.number(),
  recurringCommission: z.boolean(),
  recurringInterval: z.nativeEnum(CommissionInterval).nullable(),
  recurringDuration: z.number().nullable(),
  isLifetimeRecurring: z.boolean().nullable(),
  cookieLength: z.number().min(1).max(180),
  defaultDomain: z.string().nullable(),
  destinationUrl: z.string().nullable(),
});

export const getProgramMetricsQuerySchema = z.object({
  interval: z.enum(intervals).default("30d"),
  start: parseDateSchema.optional(),
  end: parseDateSchema.optional(),
});

export const ProgramInviteSchema = z.object({
  id: z.string(),
  email: z.string(),
  program: ProgramSchema,
});
