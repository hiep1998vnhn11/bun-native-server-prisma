import { PrismaClient } from '@prisma/client'
import { Redis } from './lib/redis'
import { Server } from 'bun'
import { join } from 'path'
import { Utils } from './lib/utils'
import { AppRequest, errorHandler } from './abstract'
import type { HTTPMethod, IRoute } from './types'
import { AppRoute } from './routes'

interface Options {
  static?: 'public'
}
export class Application {
  port: number = 3000
  readonly prisma: PrismaClient
  readonly redis: Redis
  private server?: Server
  private readonly options: Options
  private readonly utils: Utils

  routes: Map<
    HTTPMethod,
    {
      dynamic: IRoute[]
      static: Record<string, IRoute>
    }
  >

  constructor(options?: Options) {
    this.prisma = new PrismaClient()
    this.redis = new Redis()
    this.utils = new Utils()
    this.routes = new Map()
    this.options = {
      static: 'public',
      ...(options || {}),
    }

    new AppRoute(this)
  }

  async disconnect() {
    await this.prisma.$disconnect()
    await this.redis.$disconnect()
  }
  async connect() {
    await this.prisma.$connect()
    await this.redis.$connect()
  }

  async getAppRequest(request: Request, route: IRoute) {
    const appRequest = new AppRequest(request)
    await appRequest.parse(route, this.prisma)

    return appRequest
  }
  async handler(request: Request) {
    try {
      const url = new URL(request.url)
      const route = this.getRequestRoute(request.method as HTTPMethod, url)
      if (route) {
        const appRequest = await this.getAppRequest(request, route)

        const handlerResponse = await route.handler(appRequest)
        if (handlerResponse instanceof Response) return handlerResponse
        if (typeof handlerResponse === 'string')
          return new Response(handlerResponse)
        return new Response(JSON.stringify(handlerResponse), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      }
      if (request.method === 'GET') {
        const dir = join(import.meta.dir, '..', this.options.static!)
        const file = Bun.file(`${dir}${url.pathname}`)
        if (await file.exists()) {
          return new Response(file)
        }
      }
      return new Response('Not found', {
        status: 404,
      })
    } catch (error) {
      return errorHandler(error)
    }
  }
  async fetch(request: Request): Promise<Response> {
    const response = await this.handler(request)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
  getRequestRoute(method: HTTPMethod, url: URL) {
    const staticRoute = this.routes.get(method)?.static[url.pathname]
    if (staticRoute) return staticRoute

    return null
  }

  /**
   *
   * @param port
   * @param callback
   */
  async listen(port: number = 3000, callback: () => void) {
    this.port = port
    this.server = Bun.serve({
      port: this.port,
      fetch: this.fetch.bind(this),
    })
    await this.connect()
    callback()
  }
}

/**
 * Create application with port 3000
 */
const app = new Application()
app.listen(3000, () => {
  console.log('App is running on http://localhost:%d', app.port)
})

process.on('SIGINT', () => {
  app.disconnect()
  console.log('Ctrl-C was pressed')
  process.exit()
})

declare module 'bun' {
  interface Env {
    readonly JWT_SECRET: string
  }
}
