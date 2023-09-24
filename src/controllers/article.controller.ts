import { PrismaClient } from '@prisma/client'
import { AppRequest } from '../abstract'
import type { StoreArticleRequest } from '../request/article'

export class ArticleController {
  constructor(private readonly prisma: PrismaClient) {}

  async index(request: AppRequest) {
    const articles = await this.prisma.article.findMany({
      where: {
        author_id: request.user!.id,
      },
    })
    return {
      data: articles,
    }
  }

  async store(request: AppRequest<StoreArticleRequest>) {
    const data = request.body
    return data
  }
}
