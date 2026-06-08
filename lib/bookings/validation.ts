import { z } from 'zod';

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  clientNotes: z.string().max(500).optional()
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
