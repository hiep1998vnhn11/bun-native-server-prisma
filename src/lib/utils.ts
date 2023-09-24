import { join } from 'path'

export class Utils {
  async readJson(path: string) {
    const file = Bun.file(path)
    if (!(await file.exists())) throw new Error('Path not found!')
    return file.json()
  }
}
