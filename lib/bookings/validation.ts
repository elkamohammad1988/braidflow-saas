import { z } from 'zod';

// Contact details for a guest checkout (no account). Required only when the
// booker isn't signed in; the create action enforces that. Email is normalized
// so the same person resolves consistently (and a future account-claim can match
// on it). Phone is optional but valuable to the braider for no-show contact.
export const guestContactSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Enter a valid email.')
    .max(254),
  phone: z.string().trim().max(30).optional()
});

export type GuestContact = z.infer<typeof guestContactSchema>;

export const createBookingSchema = z.object({
  serviceId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  clientNotes: z.string().max(500).optional(),
  // Present for guest bookings; ignored when the booker is authenticated.
  guest: guestContactSchema.optional()
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
