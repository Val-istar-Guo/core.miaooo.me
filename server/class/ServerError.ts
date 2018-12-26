import { CustomError } from 'ts-custom-error'

export default class extends CustomError {
  expose: boolean

  constructor(public status: number, message: string) {
    super(message)
    this.expose = true
    this.name = 'ServerError'
  }
}
