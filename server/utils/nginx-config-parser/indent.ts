interface NginxCofnigParseFunc<T> {
  (config: T): (string | string[])[] | string
}

interface IndentFunc {
  <T> (fn: NginxCofnigParseFunc<T>): StandarFunc<T>
}

interface StandarFunc <T> {
  (config?: T): string[]
}

export const combineIndent: IndentFunc = fn => config => {
  if (config === undefined) return []

  let result = fn(config)
  if (typeof result === 'string') result = [result]

  return result
    .reduce((arr: string[], item) => {
      if (Array.isArray(item)) arr.push(...item)
      else arr.push(item)

      return arr
    }, [])
    // .filter(item => item.length)
}

export const indent: IndentFunc = fn => config => combineIndent(fn)(config)
  .map(item => `  ${item}`)


// export const blockIndent: IndentFunc = fn => config => {
//   if (!config) return []
//   const result = indent(fn)(config)
//   if (result.length) return ['', ...indent(fn)(config)]
//   return result
// }

export const block = <T>(fn: StandarFunc<T>) => (config?: T) => {
  const result = fn(config)
  if (result.length) return [''].concat(result)
  return result
}

export const blockIndent: IndentFunc = fn => config => block(indent(fn))(config)

export const mapIndent = <T>(arr: T[], fn: StandarFunc<T>): string[] => {
  return arr
    .map(item => fn(item))
    .reduce((arr, item) => ([...arr, ...item]), [])
}
