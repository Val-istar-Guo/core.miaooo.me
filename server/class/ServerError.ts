import { CustomError } from 'ts-custom-error'
import { Message } from '../types'

export default class extends CustomError {
  expose: boolean

  constructor(public status: number, message: Message) {
    super(message)
    this.expose = true
    this.name = 'ServerError'
  }
}
