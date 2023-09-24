import { z } from 'zod'

export const StoreArticleRequestSchema = z.object({
  title: z.string().max(128).min(1),
  content: z.string().max(30000).nullable(),
  is_active: z.boolean(),
})

export type StoreArticleRequest = z.infer<typeof StoreArticleRequestSchema>
