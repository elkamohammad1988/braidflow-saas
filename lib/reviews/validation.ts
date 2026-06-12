import { z } from 'zod';

export const submitReviewSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1, 'Pick a rating.').max(5),
  body: z.string().trim().max(1000, 'Keep it under 1000 characters.').optional().or(z.literal(''))
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
