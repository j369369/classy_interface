import React, { useContext, useCallback } from 'react'
// import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'

import styled, { ThemeContext } from 'styled-components'
// import { Pair, JSBI } from '@uniswap/sdk'
import { SwapPoolTabs } from '../../components/NavigationTabs'

// import { useUserHasLiquidityInAllTokens } from '../../data/V1'
// import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import {/* StyledInternalLink, ExternalLink, */ TYPE, /*HideSmall*/ } from '../../theme'
// import { Text } from 'rebass'
// import Card from '../../components/Card'
import { RowBetween } from '../../components/Row'
// import { ButtonPrimary, ButtonSecondary } from '../../components/Button'
import { AutoColumn } from '../../components/Column'
import { FarmRow } from '../../components/Farm'

import { useActiveWeb3React } from '../../hooks'
// import { usePairs } from '../../data/Reserves'
// import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
// import { Dots } from '../../components/swap/styleds'
//import { DataCard,  CardSection, CardNoise, CardBGImage } from '../../components/earn/styled'
// import { useStakingInfo } from '../../state/stake/hooks'
// import { BIG_INT_ZERO } from '../../constants'


import farms  from '../../constants/farm/farms'

import {usePollFarmsPublicData, usePollFarmsWithUserData} from 'state/farms/hooks'

import { Farm as FarmConfig } from 'state/farms/types'
import BigNumber from 'bignumber.js'
import { ChainId } from '@uniswap/sdk'
import { getFarmApr } from 'utils/apr'
import { BIG_ZERO,BIG_ONE } from 'utils/bigNumber'
import { useFarms } from 'state/farms/hooks'





const PageWrapper = styled(AutoColumn)`
  padding: 1.5rem;
  max-width: 1200px;
  width: 100%;
  background: var(--bg-gradient-white-02);
  backdrop-filter: var(--bg-filter-blur);
  box-shadow: var(--bg-box-shadow);
  border-radius: 1rem;

  @media(max-width: 768px) {
    padding: 1rem;
  }
`
/*
const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`
*/

const TitleRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
    //flex-direction: column-reverse;
    text-align: center;
  `};
`
/*

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
  `};
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  width: fit-content;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`


const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  width: fit-content;
  //background: var(--aqua);
  border: none;
  //border-radius: 0.25rem;
  //color: var(--white);
  font-size: 14px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 48%;
  `};
`
const EmptyProposals = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const PoolTitle = styled.div`
  @media(max-width: 768px) {
    font-size: 18px;
  }
`
*/

interface FarmWithStakedValue extends FarmConfig {
  apr?: number
  lpRewardsApr?: number
  liquidity?: BigNumber
}

export default function Farm() {


  // usePollFarmsPublicData()
  usePollFarmsWithUserData()
  const { data: farmsLP, userDataLoaded } = useFarms()
  const isActive = true
  // TODO: cakeprice 구해야함
  const classyPrice = BIG_ONE;
        
  const chainid = ChainId.MAINNET;

  const farmsList = useCallback(
    (farmsToDisplay: FarmConfig[]): FarmWithStakedValue[] => {
      let farmsToDisplayWithAPR: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
        
        // if (!farm.lpTotalInQuoteToken || !farm.quoteToken.ethPrice) {
        //   return farm
        // }

        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken!).times(farm.quoteToken.ethPrice!)
        const { cakeRewardsApr, lpRewardsApr } = isActive
          ? getFarmApr(new BigNumber(farm.poolWeight!), classyPrice, totalLiquidity, farm.lpAddresses[1]!)
          : { cakeRewardsApr: 0, lpRewardsApr: 0 }

        return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      // if (query) {
      //   const lowercaseQuery = latinise(query.toLowerCase())
      //   farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: FarmWithStakedValue) => {
      //     return latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery)
      //   })
      // }
      return farmsToDisplayWithAPR
    },
    [classyPrice, isActive],
  )
  
  
  const renderContent = (): JSX.Element => {
    return <> 
    <div className="space-y-4">
          {farmsList(farmsLP).map((farm, index) => (
            <FarmRow key={index} farm={farm} price={classyPrice} />
          ))}
        </div>
    </>
  }



  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active={'pool'} />
        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="lg" style={{ width: '100%' }}>
            <TitleRow padding={'0'}>
              <TYPE.title_B style={{ fontSize: '16px', justifySelf: 'flex-start' }}>
              Stake LP tokens to earn.
              </TYPE.title_B>
            </TitleRow>

            {renderContent()}

            
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}
