import { ChainId } from '@uniswap/sdk'
import addresses from 'constants/farm/contracts'
import tokens from 'constants/farm/tokens'
import { Address } from 'constants/farm/types'

export const getAddress = (address: Address): string => {
  // return address[ChainId.MATIC] ? address[ChainId.MATIC]! : address[ChainId.MUMBAI]!
  return address[80001]!
}

export const getCakeAddress = () => {
  return getAddress(tokens.cake.address)
}
export const getMasterChefAddress = () => {
  return getAddress(addresses.masterChef)
}
export const getMulticallAddress = () => {
  return getAddress(addresses.multiCall)
}
export const getWbnbAddress = () => {
  return getAddress(tokens.wbnb.address)
}
// export const getLotteryV2Address = () => {
//   return getAddress(addresses.lotteryV2)
// }
// export const getPancakeProfileAddress = () => {
//   return getAddress(addresses.pancakeProfile)
// }
// export const getPancakeRabbitsAddress = () => {
//   return getAddress(addresses.pancakeRabbits)
// }
// export const getBunnyFactoryAddress = () => {
//   return getAddress(addresses.bunnyFactory)
// }
// export const getClaimRefundAddress = () => {
//   return getAddress(addresses.claimRefund)
// }
// export const getPointCenterIfoAddress = () => {
//   return getAddress(addresses.pointCenterIfo)
// }
// export const getBunnySpecialAddress = () => {
//   return getAddress(addresses.bunnySpecial)
// }
// export const getTradingCompetitionAddress = () => {
//   return getAddress(addresses.tradingCompetition)
// }
// export const getEasterNftAddress = () => {
//   return getAddress(addresses.easterNft)
// }
// export const getCakeVaultAddress = () => {
//   return getAddress(addresses.cakeVault)
// }
// export const getPredictionsAddress = () => {
//   return getAddress(addresses.predictions)
// }
// export const getChainlinkOracleAddress = () => {
//   return getAddress(addresses.chainlinkOracle)
// }
// export const getBunnySpecialCakeVaultAddress = () => {
//   return getAddress(addresses.bunnySpecialCakeVault)
// }
// export const getBunnySpecialPredictionAddress = () => {
//   return getAddress(addresses.bunnySpecialPrediction)
// }
// export const getBunnySpecialLotteryAddress = () => {
//   return getAddress(addresses.bunnySpecialLottery)
// }
// export const getFarmAuctionAddress = () => {
//   return getAddress(addresses.farmAuction)
// }
