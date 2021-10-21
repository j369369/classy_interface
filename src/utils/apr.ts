import BigNumber from 'bignumber.js'
// import { BLOCKS_PER_YEAR, CAKE_PER_YEAR } from 'config'
import lpAprs from 'constants/farm/lpAprs.json'


export const BSC_BLOCK_TIME = 3
export const BLOCKS_PER_YEAR = new BigNumber((60 / BSC_BLOCK_TIME) * 60 * 24 * 365) // 10512000

export const CAKE_PER_BLOCK = new BigNumber(40)
export const CAKE_PER_YEAR = CAKE_PER_BLOCK.times(BLOCKS_PER_YEAR)


/**
 * Get the APR value in %
 * @param stakingTokenPrice Token price in the same quote currency
 * @param rewardTokenPrice Token price in the same quote currency
 * @param totalStaked Total amount of stakingToken in the pool
 * @param tokenPerBlock Amount of new cake allocated to the pool for each new block
 * @returns Null if the APR is NaN or infinite.
 */
export const getPoolApr = (
  stakingTokenPrice: number,
  rewardTokenPrice: number,
  totalStaked: number,
  tokenPerBlock: number,
): number => {
  const totalRewardPricePerYear = new BigNumber(rewardTokenPrice).times(tokenPerBlock).times(BLOCKS_PER_YEAR)
  const totalStakingTokenInPool = new BigNumber(stakingTokenPrice).times(totalStaked)
  const apr = totalRewardPricePerYear.div(totalStakingTokenInPool).times(100)
  return apr.isNaN() || !apr.isFinite() ? null! : apr.toNumber()!
}

/**
 * Get farm APR value in %
 * @param poolWeight allocationPoint / totalAllocationPoint
 * @param cakePriceUsd Cake price in USD
 * @param poolLiquidityUsd Total pool liquidity in USD
 * @returns
 */
export const getFarmApr = (
  poolWeight: BigNumber,
  cakePriceUsd: BigNumber,
  poolLiquidityUsd: BigNumber,
  farmAddress: string,
): { cakeRewardsApr: number; lpRewardsApr: number } => {
  const yearlyCakeRewardAllocation = CAKE_PER_YEAR.times(poolWeight)
  const cakeRewardsApr = yearlyCakeRewardAllocation.times(cakePriceUsd).div(poolLiquidityUsd).times(100)
  let cakeRewardsAprAsNumber = null
  if (!cakeRewardsApr.isNaN() && cakeRewardsApr.isFinite()) {
    cakeRewardsAprAsNumber = cakeRewardsApr.toNumber()
  }
  const idx :string = farmAddress?.toLocaleLowerCase()
  const lpRewardsApr = lpAprs["0x3747e3e107223539fd09bb730b055a1f11f78adf"] ?? 0
  return { cakeRewardsApr: cakeRewardsAprAsNumber!, lpRewardsApr }
}

export default null
