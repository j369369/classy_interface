import React, { useContext } from 'react'
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

import {usePollFarmsPublicData} from 'state/farms/hooks'


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

export default function Farm() {




  // const farmsList = state.farmsList

  const farm = usePollFarmsPublicData()
  
  const renderContent = (): JSX.Element => {


    
    return <> 
    
    <div className="space-y-4">
          {farms.map((farm, index) => (
            <FarmRow key={index} farm={farm} />
          ))}
        </div>
    </>




      // console.log(rowData)
      // const columnSchema = DesktopColumnSchema

      // const columns = columnSchema.map((column) => ({
      //   id: column.id,
      //   name: column.name,
      //   label: column.label,
      //   sort: (a: RowType<RowProps>, b: RowType<RowProps>) => {
      //     switch (column.name) {
      //       case 'farm':
      //         return b.id - a.id
      //       case 'apr':
      //         if (a.original.apr.value && b.original.apr.value) {
      //           return Number(a.original.apr.value) - Number(b.original.apr.value)
      //         }

      //         return 0
      //       case 'earned':
      //         return a.original.earned.earnings - b.original.earned.earnings
      //       default:
      //         return 1
      //     }
      //   },
      //   sortable: column.sortable,
      // }))

      // return <Table data={rowData} columns={columns} userDataReady={userDataReady} />

  }




  // const theme = useContext(ThemeContext)
  // const { account } = useActiveWeb3React()

  // // fetch the user's balances of all tracked V2 LP tokens
  // const trackedTokenPairs = useTrackedTokenPairs()
  // const tokenPairsWithLiquidityTokens = useMemo(
  //   () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
  //   [trackedTokenPairs]
  // )
  // const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
  //   tokenPairsWithLiquidityTokens
  // ])
  // const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
  //   account ?? undefined,
  //   liquidityTokens
  // )

  // // fetch the reserves for all V2 pools in which the user has a balance
  // const liquidityTokensWithBalances = useMemo(
  //   () =>
  //     tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
  //       v2PairsBalances[liquidityToken.address]?.greaterThan('0')
  //     ),
  //   [tokenPairsWithLiquidityTokens, v2PairsBalances]
  // )

  // const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  // const v2IsLoading =
  //   fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  // const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  // const hasV1Liquidity = useUserHasLiquidityInAllTokens()

  // // show liquidity even if its deposited in rewards contract
  // const stakingInfo = useStakingInfo()
  // const stakingInfosWithBalance = stakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  // const stakingPairs = usePairs(stakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))

  // // remove any pairs that also are included in pairs with stake in mining pool
  // const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
  //   return (
  //     stakingPairs
  //       ?.map(stakingPair => stakingPair[1])
  //       .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
  //   )
  // })

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
