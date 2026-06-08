import { z } from 'zod';

const instagramHandle = z
  .string()
  .trim()
  .max(30)
  .regex(/^[A-Za-z0-9._]+$/, 'Letters, numbers, dots and underscores only.')
  .optional()
  .or(z.literal(''));

export const braiderSettingsSchema = z.object({
  fullName: z.string().trim().min(2, 'Add your name.').max(80),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+()\d\s-]*$/, "That doesn't look like a phone number.")
    .optional()
    .or(z.literal('')),
  businessName: z.string().trim().min(2, 'Add a business name.').max(80),
  bio: z.string().trim().max(800).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  instagramHandle,
  acceptingBookings: z.boolean()
});

export type BraiderSettingsInput = z.infer<typeof braiderSettingsSchema>;
