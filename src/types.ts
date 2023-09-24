import { z } from 'zod'
import { AppRequest } from './abstract'

export type HTTPMethod =
  | 'ACL'
  | 'BIND'
  | 'CHECKOUT'
  | 'CONNECT'
  | 'COPY'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'LINK'
  | 'LOCK'
  | 'M-SEARCH'
  | 'MERGE'
  | 'MKACTIVITY'
  | 'MKCALENDAR'
  | 'MKCOL'
  | 'MOVE'
  | 'NOTIFY'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'PURGE'
  | 'PUT'
  | 'REBIND'
  | 'REPORT'
  | 'SEARCH'
  | 'SOURCE'
  | 'SUBSCRIBE'
  | 'TRACE'
  | 'UNBIND'
  | 'UNLINK'
  | 'UNLOCK'
  | 'UNSUBSCRIBE'
  | 'ALL'

export interface IRoute {
  handler: (req: AppRequest) => Promise<any>
  url: string
  schema?: z.ZodObject<any>
  middleware?: string | string[]
  requireAuth?: boolean
}

export interface RequestUser {
  id: number
  email: string
  name: string | null
  created_at: Date
  updated_at: Date
}
export interface JWTPayload extends RequestUser {
  exp: number
  iat: number
}
