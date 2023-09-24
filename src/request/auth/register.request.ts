import { z } from 'zod'

export const RegisterRequestSchema = z.object({
  name: z.string().max(128),
  email: z.string().email().max(128),
  password: z.string().max(128).min(6),
})

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
