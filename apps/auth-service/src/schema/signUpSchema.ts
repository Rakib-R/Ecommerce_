import { z } from 'zod';

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-zA-Z\s'-]+$/, 'Invalid name'),
  email: z.email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(['user', 'seller']), // ← locks role to only valid values
  isAgreedToTerms: z.literal(true, { message: 'Must agree to TOS' }),
});

// ZOD - FIX — spread the .shape, not the schema itself:

export const userSignUpSchema = z.object({
  ...signUpSchema.shape,
  avatarFileId: z.string().optional(),
  avatarFileUrl: z.string().optional(),
});

// ZOD - FIX — spread the .shape, not the schema itself:

export const sellerSignUpSchema = z.object({
  ...signUpSchema.shape,
  phone_number: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/)
    .optional(),
  country: z.string().length(2).optional(),
  avatarFileId: z.string().optional(),
  avatarFileUrl: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// TypeScript Types Inference
export type UserSignUpInput = z.infer<typeof userSignUpSchema>;
export type SellerSignUpInput = z.infer<typeof sellerSignUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
