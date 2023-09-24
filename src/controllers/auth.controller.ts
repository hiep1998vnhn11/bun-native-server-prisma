import { PrismaClient } from '@prisma/client'
import { AppRequest } from '../abstract'
import { RegisterRequest } from '../request/auth/register.request'
import { LoginRequest } from '../request/auth/login.request'
import { UnauthorizedError } from '../exceptions/unauthorized.error'
import JWT from 'jsonwebtoken'
export class AuthController {
  constructor(private readonly prisma: PrismaClient) {}
  async login(request: AppRequest<LoginRequest>) {
    const data = request.body
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        email: data.email,
      },
    })
    const checkPassword = await Bun.password.verify(
      data.password,
      user.password
    )
    if (!checkPassword) throw new UnauthorizedError()
    const { password, ...rest } = user
    const accessToken = JWT.sign(rest, Bun.env.JWT_SECRET!, {
      expiresIn: '7days',
    })
    return {
      user: rest,
      accessToken,
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    }
  }

  async me(request: AppRequest) {
    return request.user
  }

  async register(request: AppRequest<RegisterRequest>) {
    const data = request.body
    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: await Bun.password.hash(data.password, {
          algorithm: 'bcrypt',
          cost: 4,
        }),
      },
    })
    return user
  }
}
