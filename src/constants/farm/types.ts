export interface Address {
    1?: string
    3: string
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