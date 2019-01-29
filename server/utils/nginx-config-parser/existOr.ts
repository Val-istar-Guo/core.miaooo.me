interface ExistOrCallBackFunc<T, U> {
  (config: T): U
}


const existOr = <U>(value: U) => <T>(fn: ExistOrCallBackFunc<T, U>) => (config?: T): U => {
  if (!config) return value
  return fn(config)
}

export const existOrEmptyArray = existOr(<string[]> [])
export const existOrEmptyString = existOr('')
