import { z } from 'zod';

export const serviceSchema = z
  .object({
    name: z.string().trim().min(2, 'Give this service a name.').max(80),
    description: z.string().trim().max(500).optional().or(z.literal('')),
    durationMinutes: z.number().int().min(30).max(1440),
    priceCents: z.number().int().min(0).max(1_000_000),
    depositCents: z.number().int().min(0).max(1_000_000),
    isActive: z.boolean()
  })
  .refine((v) => v.depositCents <= v.priceCents, {
    message: 'Deposit can\'t be more than the price.',
    path: ['depositCents']
  });

export type ServiceInput = z.infer<typeof serviceSchema>;
