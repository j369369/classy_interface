import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { getBalanceAmount } from 'utils/formatBalance'
// import { farmsConfig } from 'config/constants'
import farmsConfig  from '../../constants/farm/farms'

// import useRefresh from 'hooks/useRefresh'
// import { fetchFarmsPublicDataAsync } from './fetchPublicFarmData'
import { State, Farm, FarmsState } from './types'

import fetchFarms from './fetchFarms'
import fetchFarmsPrices from './fetchFarmsPrices'

// export const fetchFarmsPublicDataAsync = createAsyncThunk<Farm[], number[]>(
//   'farms/fetchFarmsPublicDataAsync',
//   async (pids) => {

//     console.log(`fetchFarmsPublicDataAsync`)
//     const farmsToFetch = farmsConfig.filter((farmConfig) => pids.includes(farmConfig.pid))

//     // Add price helper farms
//     const farmsWithPriceHelpers = farmsToFetch.concat(priceHelperLpsConfig)

//     const farms = await fetchFarms(farmsWithPriceHelpers)
//     const farmsWithPrices = await fetchFarmsPrices(farms)

//     // Filter out price helper LP config farms
//     const farmsWithoutHelperLps = farmsWithPrices.filter((farm: Farm) => {
//       return farm.pid || farm.pid === 0
//     })

//     return farmsWithoutHelperLps
//   },
// )

export const fetchFarmsPublicDataAsync = async (pids : number[]) => {
  console.log(`fetchFarmsPublicDataAsync`)
    const farmsToFetch = farmsConfig.filter((farmConfig) => pids.includes(farmConfig.pid))

    // Add price helper farms
    // const farmsWithPriceHelpers = farmsToFetch.concat(priceHelperLpsConfig)

    const farms = await fetchFarms(farmsToFetch)
    const farmsWithPrices = await fetchFarmsPrices(farms)

    // Filter out price helper LP config farms
    const farmsWithoutHelperLps = farmsWithPrices.filter((farm: Farm) => {
      return farm.pid || farm.pid === 0
    })

    return farmsWithoutHelperLps
}



export const usePollFarmsPublicData = (includeArchive = true) => {
  console.log(`usePollFarmsPublicData`)
  const farmsToFetch = includeArchive ? farmsConfig : null
  const pids = farmsToFetch?.map((farmToFetch) => farmToFetch.pid)

  console.log(pids)
  return fetchFarmsPublicDataAsync(pids!)  
}

// export const usePollFarmsWithUserData = (includeArchive = false) => {
//   const dispatch = useAppDispatch()
//   const { slowRefresh } = useRefresh()
//   const { account } = useWeb3React()

//   useEffect(() => {
//     const farmsToFetch = includeArchive ? farmsConfig : nonArchivedFarms
//     const pids = farmsToFetch.map((farmToFetch) => farmToFetch.pid)

//     dispatch(fetchFarmsPublicDataAsync(pids))

//     if (account) {
//       dispatch(fetchFarmUserDataAsync({ account, pids }))
//     }
//   }, [includeArchive, dispatch, slowRefresh, account])
// }

/**
 * Fetches the "core" farm data used globally
 * 251 = CAKE-BNB LP
 * 252 = BUSD-BNB LP
 */
// export const usePollCoreFarmData = () => {
//   const dispatch = useAppDispatch()
//   const { fastRefresh } = useRefresh()

//   useEffect(() => {
//     dispatch(fetchFarmsPublicDataAsync([251, 252]))
//   }, [dispatch, fastRefresh])
// }

export const useFarms = (): FarmsState => {
  console.log(`useFarms call`)
  const farms = useSelector((state: State) => state.farms)
  return farms
}

export const useFarmFromPid = (pid: any): Farm => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.pid === pid))
  return farm!
}

export const useFarmFromLpSymbol = (lpSymbol: string): Farm => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.lpSymbol === lpSymbol))
  return farm!
}

export const useFarmUser = (pid:any) => {
  const farm = useFarmFromPid(pid)

  return {
    allowance: farm.userData ? new BigNumber(farm.userData.allowance) : BIG_ZERO,
    tokenBalance: farm.userData ? new BigNumber(farm.userData.tokenBalance) : BIG_ZERO,
    stakedBalance: farm.userData ? new BigNumber(farm.userData.stakedBalance) : BIG_ZERO,
    earnings: farm.userData ? new BigNumber(farm.userData.earnings) : BIG_ZERO,
  }
}

// Return the base token price for a farm, from a given pid
export const useBusdPriceFromPid = (pid: number): BigNumber => {
  const farm = useFarmFromPid(pid)
  return farm && new BigNumber(farm.token.ethPrice!)
}

export const useLpTokenPrice = (symbol: string) => {
  const farm = useFarmFromLpSymbol(symbol)
  const farmTokenPriceInUsd = useBusdPriceFromPid(farm.pid)
  let lpTokenPrice = BIG_ZERO

  if (farm.lpTotalSupply && farm.lpTotalInQuoteToken) {
    // Total value of base token in LP
    const valueOfBaseTokenInFarm = farmTokenPriceInUsd.times(farm.tokenAmountTotal!)
    // Double it to get overall value in LP
    const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm.times(2)
    // Divide total value of all tokens, by the number of LP tokens
    const totalLpTokens = getBalanceAmount(new BigNumber(farm.lpTotalSupply))
    lpTokenPrice = overallValueOfAllTokensInFarm.div(totalLpTokens)
  }

  return lpTokenPrice
}

// /!\ Deprecated , use the BUSD hook in /hooks

export const usePriceCakeBusd = (): BigNumber => {
  const cakeBnbFarm = useFarmFromPid(251)

  const cakePriceBusdAsString = cakeBnbFarm.token.ethPrice

  const cakePriceBusd = useMemo(() => {
    return new BigNumber(cakePriceBusdAsString!)
  }, [cakePriceBusdAsString])

  return cakePriceBusd
}
