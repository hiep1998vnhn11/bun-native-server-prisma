import { z } from 'zod'
import { AppRequest } from './abstract'
import { AuthController } from './controllers/auth.controller'
import type { Application } from './server'
import { IRoute } from './types'
import { RegisterRequestSchema } from './request/auth/register.request'
import { LoginRequestSchema } from './request/auth/login.request'
import { ArticleController } from './controllers/article.controller'
import { StoreArticleRequestSchema } from './request/article'

export class AppRoute {
  private readonly authController: AuthController
  private readonly articleController: ArticleController
  constructor(private readonly app: Application) {
    this.authController = new AuthController(this.app.prisma)
    this.articleController = new ArticleController(this.app.prisma)

    this.defineRoutes()
  }
  defineRoutes() {
    this.post(
      '/api/login',
      this.authController.login.bind(this.authController),
      {
        schema: LoginRequestSchema,
      }
    )
    this.get('/api/me', this.authController.me.bind(this.authController), {
      requireAuth: true,
    })
    this.post(
      '/api/register',
      this.authController.register.bind(this.authController),
      {
        schema: RegisterRequestSchema,
      }
    )

    this.get(
      '/api/article',
      this.articleController.index.bind(this.articleController),
      {
        requireAuth: true,
      }
    )
    this.post(
      '/api/article',
      this.articleController.store.bind(this.articleController),
      {
        requireAuth: true,
        schema: StoreArticleRequestSchema,
      }
    )
  }

  get(
    path: string,
    handler: (request: AppRequest) => any,
    option?: {
      middleware?: string | string[]
      requireAuth?: boolean
    }
  ) {
    const getRoutes = this.app.routes.get('GET')
    const isStatic = this.isStatic(path)
    const newRoute = {
      handler,
      url: path,
      ...(option || {}),
    }
    if (getRoutes) {
      if (isStatic && !getRoutes.static[path]) {
        getRoutes.static[path] = newRoute
      }
    } else {
      if (isStatic) {
        const getRoutes = {
          static: {
            [path]: newRoute,
          },
          dynamic: [],
        }
        this.app.routes.set('GET', getRoutes)
      }
    }
  }
  post(
    path: string,
    handler: (request: AppRequest) => any | Promise<any>,
    option?: {
      schema?: z.ZodObject<any>
      middleware?: string | string[]
      requireAuth?: boolean
    }
  ) {
    const getRoutes = this.app.routes.get('POST')
    const isStatic = this.isStatic(path)
    const newRoute: IRoute = {
      handler,
      url: path,
      ...(option || {}),
    }
    if (getRoutes) {
      if (isStatic && !getRoutes.static[path]) {
        getRoutes.static[path] = newRoute
      }
    } else {
      if (isStatic) {
        const getRoutes = {
          static: {
            [path]: newRoute,
          },
          dynamic: [],
        }
        this.app.routes.set('POST', getRoutes)
      }
    }
  }

  isStatic(path: string): boolean {
    if (path.includes(':') || path.includes('*')) return false
    return true
  }
}
