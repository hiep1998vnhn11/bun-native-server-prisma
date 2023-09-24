import { createClient, RedisClientType } from 'redis'
export class Redis {
  private readonly client: RedisClientType
  constructor() {
    this.client = createClient({
      url: 'redis://localhost:6379',
    })
  }

  async $connect() {
    await this.client.connect()
  }
  async $disconnect() {
    await this.client.disconnect()
  }
}
