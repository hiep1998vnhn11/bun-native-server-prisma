import { PrismaClient, Shop } from '@prisma/client'
import { AppRequest } from '../abstract'
import type { SapoOrder } from '../types'

export class WebhookController {
  constructor(private readonly prisma: PrismaClient) {}
  async index(request: AppRequest) {
    // TODO: verify webhook
    const shop = await this.prisma.shop.findFirstOrThrow({
      where: {
        name: 'test',
      },
    })
    const topic = 'orders/updated'
    switch (topic) {
      case 'orders/updated':
        this.processOrder(request.body, shop)
        break
      default:
        break
    }
    await new Promise((r) => setTimeout(r, 1000))
    return {
      status: 'success',
    }
  }

  async processOrder(order: SapoOrder, shop: Shop) {
    const customerId = order.customer?.id || null
    const status = order.status === 'open' ? 1 : 0
    let amount = 0
    const lineItems = JSON.stringify(
      order.line_items.map((item) => {
        amount += item.quantity
        return {
          sku: item.sku,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        }
      })
    )

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO orders (shop_id,
order_shop_id,
customer_shop_id,
order_code,
email,
phone,
note,
tags,
status,
line_items,
total,
amount,
updated_at)
  VALUES (${shop.id},${order.id},?, ?, ?, ?, ?, ?, ?,?,?, ?, NOW())
  ON DUPLICATE KEY UPDATE
  shop_id = ${shop.id},
  customer_shop_id = ?,
  order_code = ?,
  email = ?,
  phone = ?,
  note = ?,
  tags = ?,
  status = ?,
  line_items = ?,
  total = ?,
  amount = ?,
  updated_at = NOW()
  `,
      customerId,
      order.name,
      order.email,
      order.phone,
      order.note,
      order.tags,
      status,
      lineItems,
      order.total_price,
      amount,
      customerId,
      order.name,
      order.email,
      order.phone,
      order.note,
      order.tags,
      status,
      lineItems,
      order.total_price,
      amount
    )
  }
}
