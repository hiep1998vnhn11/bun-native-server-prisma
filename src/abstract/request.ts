import JWT from 'jsonwebtoken'
import type { IRoute, JWTPayload, RequestUser } from '../types'
import { UnauthorizedError } from '../exceptions/unauthorized.error'
import { PrismaClient } from '@prisma/client'
import { parse as parseQueryString } from 'fast-querystring'

export class AppRequest<T = any> {
  private isBodyParsed = false
  body: T = {} as T
  user?: RequestUser
  constructor(readonly request: Request) {}

  async parse(route: IRoute, prisma: PrismaClient) {
    if (route.requireAuth) {
      const token = this.request.headers.get('Authorization')
      if (!token) throw new UnauthorizedError()
      if (!token.startsWith('Bearer ')) throw new UnauthorizedError()
      const jwtToken = token.slice(7)
      try {
        const { exp, iat, id } = JWT.verify(
          jwtToken,
          Bun.env.JWT_SECRET
        ) as JWTPayload
        if (new Date(exp * 1000) < new Date()) throw new Error()
        const { password, ...user } = await prisma.user.findFirstOrThrow({
          where: {
            id,
          },
        })
        this.user = user
      } catch (err) {
        throw new UnauthorizedError()
      }
    }
    const schema = route.schema
    if (this.request.method !== 'GET' && !this.isBodyParsed) {
      let contentType = this.request.headers.get('Content-Type')
      if (contentType) {
        const semiIndex = contentType.indexOf(';')
        if (semiIndex > 0) {
          contentType = contentType.slice(0, semiIndex)
        }
      }
      switch (contentType) {
        case 'application/json':
          const body = await this.request.json()
          if (schema) {
            this.body = schema.parse(body) as T
          } else this.body = body
          break
        case 'application/x-www-form-urlencoded':
          const formEncoded = parseQueryString(await this.request.text()) as T
          this.body = schema ? (schema.parse(formEncoded) as T) : formEncoded
          break
        case 'multipart/form-data':
          const formData: any = {}
          const form = await this.request.formData()
          for (const key of form.keys()) {
            if (formData[key]) continue
            const value = form.getAll(key)
            if (value.length === 1) formData[key] = value[0]
            else formData[key] = value
          }
          this.body = schema ? (schema.parse(formData) as T) : formData
          break
        default:
          if (schema) schema.parse({})
      }
    } else this.isBodyParsed = true
  }
}
