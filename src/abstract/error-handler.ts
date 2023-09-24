import { z } from 'zod'
import { PrismaClient, Prisma } from '@prisma/client'
import { UnauthorizedError } from '../exceptions/unauthorized.error'

export function errorHandler(error: any) {
  if (error instanceof z.ZodError) {
    return new Response(
      JSON.stringify({
        message: 'Invalid request',
        errors: error.errors,
      }),
      {
        status: 422,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002')
      return new Response(
        JSON.stringify({
          message: 'Duplicate constraint violation!',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
  }
  if (error instanceof UnauthorizedError)
    return new Response(
      JSON.stringify({
        message: 'Unauthorized',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  console.log(error)
  return new Response('Server error', {
    status: 500,
  })
}
