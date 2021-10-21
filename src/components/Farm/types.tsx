import BigNumber from 'bignumber.js'
import { Address, Token,FarmConfig } from 'constants/farm/types'


export interface AprProps {
    value: string
    multiplier: string
    pid: number
    lpLabel: string
    lpSymbol: string
    tokenAddress?: Address
    quoteTokenAddress?: Address
    cakePrice: BigNumber
    originalValue: number
    hideButton?: boolean
}
export interface FarmProps {
    label: string
    pid: number
    token: Token
    quoteToken: Token
}
export interface EarnedProps {
    earnings: number
    pid: number
}


export interface MultiplierProps {
    multiplier: string
}

export interface LiquidityProps {
    liquidity: BigNumber
}

export interface FarmWithStakedValue extends Farm {
    apr?: number
    lpRewardsApr?: number
    liquidity?: BigNumber
    rewardPerBlock?: SerializedBigNumber
}

export type SerializedBigNumber = string

export interface Farm extends FarmConfig {
    tokenAmountMc?: SerializedBigNumber
    quoteTokenAmountMc?: SerializedBigNumber
    tokenAmountTotal?: SerializedBigNumber
    quoteTokenAmountTotal?: SerializedBigNumber
    lpTotalInQuoteToken?: SerializedBigNumber
    lpTotalSupply?: SerializedBigNumber
    tokenPriceVsQuote?: SerializedBigNumber
    poolWeight?: SerializedBigNumber
    userData?: {
      allowance: string
      tokenBalance: string
      stakedBalance: string
      earnings: string
    }
}

export interface RowProps {
    apr: AprProps
    farm: FarmProps
    earned: EarnedProps
    multiplier: MultiplierProps
    liquidity: LiquidityProps
    details: FarmWithStakedValue
}

export default RowProps