/**
 * Bursluluk başvuru formu doğrulama şeması (Zod).
 * Yalnızca kritik alanlar doğrulanır; diğer alanlar opsiyoneldir.
 */

import { z } from "zod";
import {
  fullNameSchema,
  emailSchema,
  phoneSchema,
  tcNoSchema,
} from "@/lib/validation/common";

export const scholarshipApplicationSchema = z.object({
  studentName: fullNameSchema,
  studentTc: tcNoSchema.optional().or(z.literal("")),
  birthDate: z.string().trim().optional().or(z.literal("")),
  parentName: fullNameSchema,
  parentPhone: phoneSchema,
  parentEmail: emailSchema,
  district: z.string().trim().max(60).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  // Spam koruması (gizli alan).
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ScholarshipApplicationValues = z.infer<
  typeof scholarshipApplicationSchema
>;
