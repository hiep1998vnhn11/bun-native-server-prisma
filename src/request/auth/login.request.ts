import { z } from 'zod'

export const LoginRequestSchema = z.object({
  email: z.string().email().max(128),
  password: z.string().max(128).min(6),
})

export type LoginRequest = z.infer<typeof LoginRequestSchema>
