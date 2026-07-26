import { z } from "zod";

export const petInputSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요").max(20),
  breed: z.string().trim().max(30).nullish(),
  sizeClass: z.enum(["SMALL", "MEDIUM", "LARGE"]),
  weightKg: z.coerce.number().positive().max(100).nullish(),
  ageYears: z.coerce.number().int().min(0).max(30).nullish(),
  energyLevel: z.coerce.number().int().min(1).max(5),
  sociability: z.coerce.number().int().min(1).max(5),
  prefersIndoor: z.coerce.boolean(),
  notes: z.string().trim().max(200).nullish(),
});

export const planInputSchema = z.object({
  petId: z.string().min(1, "함께 갈 아이를 선택해 주세요"),
  theme: z.enum([
    "NATURE_HEALING",
    "CAFE_FOOD",
    "HISTORY_CULTURE",
    "ACTIVITY",
  ]),
  totalMinutes: z.coerce.number().int().min(120).max(720),
  startTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .default("10:00"),
});

export const visitInputSchema = z.object({
  petId: z.string().min(1),
  placeId: z.string().min(1),
  routeId: z.string().nullish(),
});

export const feedbackInputSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(300).nullish(),
});

export type PetInputForm = z.infer<typeof petInputSchema>;
export type PlanInput = z.infer<typeof planInputSchema>;
