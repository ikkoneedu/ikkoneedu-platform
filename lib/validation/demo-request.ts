/**
 * Demo talep formu doğrulama şeması (Zod).
 */

import { z } from "zod";
import {
  fullNameSchema,
  emailSchema,
  phoneSchema,
  schoolNameSchema,
} from "@/lib/validation/common";

export const demoRequestSchema = z.object({
  institution: schoolNameSchema,
  fullName: fullNameSchema,
  role: z.string().trim().max(60).optional().or(z.literal("")),
  phone: phoneSchema,
  email: emailSchema,
  city: z.string().trim().max(60).optional().or(z.literal("")),
  institutionType: z.string().trim().max(60).optional().or(z.literal("")),
  studentCount: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Mesaj çok uzun.").optional().or(z.literal("")),
  // Spam koruması (gizli alan).
  company: z.string().max(0).optional().or(z.literal("")),
});

export type DemoRequestValues = z.infer<typeof demoRequestSchema>;
