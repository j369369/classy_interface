export interface Address {
    137?: string
    80001: string
  }
  
export interface Token {
  symbol: string
  address?: Address
  decimals?: number
  projectLink?: string
  ethPrice?: string
}

export interface FarmConfig {
    pid: number
    lpSymbol: string
    lpAddresses: Address
    token: Token
    quoteToken: Token
    multiplier?: string
    isCommunity?: boolean
    dual?: {
      rewardPerBlock: number
      earnLabel: string
      endBlock: number
    }
  }