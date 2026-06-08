import { z } from 'zod';

export const availabilityRuleSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440)
  })
  .refine((v) => v.endMinute > v.startMinute, {
    message: 'End time has to be after start time.',
    path: ['endMinute']
  });

export const overrideSchema = z
  .object({
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    note: z.string().max(120).optional().or(z.literal(''))
  })
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: 'End time has to be after start time.',
    path: ['endsAt']
  });

export type AvailabilityRuleInput = z.infer<typeof availabilityRuleSchema>;
export type OverrideInput = z.infer<typeof overrideSchema>;
