export enum CATypes {
  LetsEncrypt = 'LetsEncrypt'
}

export enum DomainTypes {
  /** 多域名 */
  Many = 'many',
  /** 单域名 */
  Signle = 'signle',
  /** 泛域名 */
  Pan = 'pan',
}

export interface CAInfo {
  readonly name: string
  readonly support: DomainTypes[]
}
