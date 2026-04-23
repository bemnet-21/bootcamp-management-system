import { z } from "zod";

export const createDivisionSchema = z.object({
  name: z.string().min(2, "name is required").trim(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateDivisionSchema = z
  .object({
    name: z.string().min(2).trim().optional(),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });