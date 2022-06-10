import React, { useContext, useMemo } from 'react'
import './Pool.css'
import { Pair, JSBI } from '@uniswap/sdk'
import { NavLink, Link } from 'react-router-dom'
import { SwapPoolTabs } from '../../components/NavigationTabs'

import FullPositionCard from '../../components/PositionCard'
import { useUserHasLiquidityInAllTokens } from '../../data/V1'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'

import { useActiveWeb3React } from '../../hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import { Dots } from '../../components/swap/styleds'
import { useStakingInfo } from '../../state/stake/hooks'
import { BIG_INT_ZERO, CURRENCIES_FULL_NAME } from '../../constants'
import TokenDefaultLogo from '../../components/TokenDefaultLogo/index';

export default function Pool() {
  const { account } = useActiveWeb3React()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map(tokens => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map(tpwlt => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some(V2Pair => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const hasV1Liquidity = useUserHasLiquidityInAllTokens()

  // show liquidity even if its deposited in rewards contract
  const stakingInfo = useStakingInfo()
  const stakingInfosWithBalance = stakingInfo?.filter(pool => JSBI.greaterThan(pool.stakedAmount.raw, BIG_INT_ZERO))
  const stakingPairs = usePairs(stakingInfosWithBalance?.map(stakingInfo => stakingInfo.tokens))

  // remove any pairs that also are included in pairs with stake in mining pool
  const v2PairsWithoutStakedAmount = allV2PairsWithLiquidity.filter(v2Pair => {
    return (
      stakingPairs
        ?.map(stakingPair => stakingPair[1])
        .filter(stakingPair => stakingPair?.liquidityToken.address === v2Pair.liquidityToken.address).length === 0
    )
  })

  return (
    <>
      <div id="pool">
        <section className="pool_head">
          {account &&
            <div className="pool_head_button_box">
              <NavLink to="/add/MATIC">
                <button type="button" className="button md yellow">
                Add Liquidity
                </button>
              </NavLink>
              <NavLink to="/create/MATIC">
                <button type="button" className="button md white">
                  Create New Pool
                </button>
              </NavLink>
            </div>
          }
        </section>
        <section className="pool_body">
          <h4 className="pool_title">Provide liquidity and get LP tokens</h4>
          
          {!account ? (
            <div className="pool_no_contents">
              Connect to a wallet to view your liquidity.
            </div>
          ) : v2IsLoading ? (
            <div className="pool_no_contents">
              <span className="text yellow">
                <Dots>Loading</Dots>
              </span>
            </div>
          ) : allV2PairsWithLiquidity?.length > 0 || stakingPairs?.length > 0 ? (
            <div className="dis_flex_col gap10">
              <h5 className="pool_title text yellow">My Pool</h5>
              <section className='pool_card_list'>
                {v2PairsWithoutStakedAmount.map(v2Pair => (
                  <>
                    <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                  </>
                ))}
                {stakingPairs.map(
                  (stakingPair, i) =>
                    stakingPair[1] && ( // skip pairs that arent loaded
                      <FullPositionCard
                        key={stakingInfosWithBalance[i].stakingRewardAddress}
                        pair={stakingPair[1]}
                        stakedBalance={stakingInfosWithBalance[i].stakedAmount}
                      />
                    )
                )}
              </section>
            </div>
          ) : (
            <div className="pool_no_contents">
              No liquidity found.
            </div>
          )}
        </section>
        {account && 
          <section className="pool_foot">
            {hasV1Liquidity ? `${CURRENCIES_FULL_NAME} liquidity found!` : "Don't see a pool you joined?"}
            <Link className="link" to={hasV1Liquidity ? '/migrate/v1' : '/find'}>
              {hasV1Liquidity ? 'Migrate now.' : 'Import it.'}
            </Link>
          </section>
        }
      </div>
    </>
  )
}
