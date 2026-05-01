import { z } from "zod";

export const ideaPayloadSchema = z.object({
  hypothesis: z.string().max(500).default(""),
  validation_status: z.enum(["untested", "validated", "invalidated"]),
  confidence: z.number().int().min(1).max(5),
});

export const decisionLogPayloadSchema = z.object({
  decision: z.string().max(500).default(""),
  reasoning: z.string().max(2000).default(""),
  decided_at: z.string().datetime(),
  outcome: z.enum(["pending", "good", "bad"]),
  unlock_reason: z.string().max(500).optional(),
});

export const moodEnergyPayloadSchema = z.object({
  energy: z.number().int().min(1).max(5),
  mood: z.string().min(1).max(8),
  note: z.string().max(500).optional(),
  recorded_at: z.string().datetime(),
});

export const sprintCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  column: z.enum(["todo", "in_progress", "done"]),
});

export const sprintPayloadSchema = z.object({
  cards: z.array(sprintCardSchema).max(10),
});

export type IdeaSchema = z.infer<typeof ideaPayloadSchema>;
export type DecisionLogSchema = z.infer<typeof decisionLogPayloadSchema>;
export type MoodEnergySchema = z.infer<typeof moodEnergyPayloadSchema>;
export type SprintSchema = z.infer<typeof sprintPayloadSchema>;
