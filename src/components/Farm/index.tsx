import { JSBI, Percent, Pair, TokenAmount } from '@uniswap/sdk'
import { darken } from 'polished'
import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Link } from 'react-router-dom'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useTotalSupply } from '../../data/TotalSupply'

import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { /*ExternalLink,*/ TYPE } from '../../theme'
import { currencyId } from '../../utils/currencyId'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ButtonPrimary, /*, ButtonSecondary,*/ ButtonEmpty } from '../Button'
//import { transparentize } from 'polished'
import { CardNoise } from '../earn/styled'

import { useColor,useDefaultBg } from '../../hooks/useColor'

import Card, { GreyCard, LightCard } from '../Card'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import FarmsLogo from '../FarmsLogo'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { Dots } from '../swap/styleds'
import { BIG_INT_ZERO } from '../../constants'
import { FarmConfig } from '../../constants/farm/types'

import RenderReward from './reward'


export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`

const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: var(--bg-gradient-white-03); 
  backdrop-filter: var(--bg-filter-blur); 
  box-shadow: var(--bg-box-shadow);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 5px;

  @media(max-width: 768px) {
    padding: 0.75rem;
  }
`

const Pooltext = styled.span`
  font-size: 18px;
  font-weight: 500;
  @media(max-width: 768px) {
    font-size: 16px;
  }
  width : 20%;
`

const Pdnbap = styled.div`
  height: 0.5rem;
  @media(max-width: 768px) {
    width:100%;
    height: 0.25rem;
  }
`

/*
const StyledPositionHead = styled.section`
  display: flex;
  justify-content: space-around;
  position: relative;
  padding: 0.5rem 1rem;
  background: var(--lightBlue-04); 
  box-shadow: var(--bg-box-shadow);
  border-radius: 0.5rem;
  color: var(--white);
  font-weight: 500;
  text-align: center;
`

const StyledPositionBody = styled.section`
  display: flex;
  justify-content: space-around;
  position: relative;
  padding: 0.5rem 1rem;
  background: var(--bg-gradient-white-03); 
  backdrop-filter: var(--bg-filter-blur); 
  box-shadow: var(--bg-box-shadow);
`


const StyleRow = styled.div`
  
`
*/


interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
}



interface FarmProp {
  farm: FarmConfig
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
}

export const FarmRow = ({ farm, ...rest } : FarmProp) => {

  const { account } = useActiveWeb3React()
  const [showMore, setShowMore] = useState(false)


  // console.log(farms)

  // const currency0 = showUnwrapped ? pair.token0 : unwrappedToken(pair.token0)
  // const currency1 = showUnwrapped ? pair.token1 : unwrappedToken(pair.token1)

  // const [showMore, setShowMore] = useState(false)

  // const userPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  // const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  // const poolTokenPercentage =
  //   !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
  //     ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
  //     : undefined

  // const [token0Deposited, token1Deposited] =
  //   !!pair &&
  //   !!totalPoolTokens &&
  //   !!userPoolBalance &&
  //   // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
  //   JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
  //     ? [
  //         pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
  //         pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
  //       ]
  //     : [undefined, undefined]

  return (

    <>
    {/* <StyledPositionHead>
      <StyleRow>Pair</StyleRow>
      <StyleRow>APR</StyleRow>
      <StyleRow>TVL</StyleRow>
      <StyleRow>Volume 24H</StyleRow>
    </StyledPositionHead>
    
    <StyledPositionBody>
      <StyleRow>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
        <Text fontWeight={500} fontSize={20}>
          {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
        </Text>
      </StyleRow>
      <StyleRow>APR</StyleRow>
      <StyleRow>TVL</StyleRow>
      <StyleRow>Volume 24H</StyleRow>
    </StyledPositionBody> */}

    <StyledPositionCard bgColor={useDefaultBg()}>
      <CardNoise />
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow gap="8px">
            <FarmsLogo farm={farm} size={18} />
            <Pooltext>
              {!farm.lpSymbol ? <Dots>Loading</Dots> : `${farm.lpSymbol}`}
            </Pooltext>

            <RenderReward farm={farm}/>

          </AutoRow>
          <RowFixed gap="8px">
            <ButtonEmpty
              padding="6px 8px"
              borderRadius="12px"
              width="130px"
              fontSize={14}
              style={{ textAlign: 'right' }}
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? (
                <>
                  Manage
                  <ChevronUp size="16" style={{ marginLeft: '0.25rem' }} />
                </>
              ) : (
                <>
                  Manage
                  <ChevronDown size="16" style={{ marginLeft: '0.25rem' }} />
                </>
              )}
            </ButtonEmpty>
          </RowFixed>
        </FixedHeightRow>

        {showMore && (
          <AutoColumn gap="8px">
            <Pdnbap />
            <FixedHeightRow >
              <Text fontSize={14} fontWeight={400}>
                Your total pool tokens:
              </Text>
              <Text fontSize={14} fontWeight={400}>
              userPoolBalance
              </Text>
            </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={14} fontWeight={400}>
                  Pool tokens in rewards pool:
                </Text>
                <Text fontSize={14} fontWeight={400}>
                  stakedBalance
                </Text>
              </FixedHeightRow>
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={14} fontWeight={400}>
                  Pooled currency0.symbol :
                </Text>
              </RowFixed>
                <RowFixed>
                  <Text fontSize={14} fontWeight={400} marginLeft={'6px'}>
                    token0Deposited
                  </Text>
                  {/* <CurrencyLogo size="16px" style={{ marginLeft: '8px', width: '18px', height: '18px' }} currency={currency0} /> */}
                </RowFixed>
            </FixedHeightRow>

            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={14} fontWeight={400}>
                  currency1.symbol
                </Text>
              </RowFixed>
                <RowFixed>
                  <Text fontSize={14} fontWeight={500} marginLeft={'6px'}>
                  token1Deposited
                  </Text>
                  {/* <CurrencyLogo size="16px" style={{ marginLeft: '8px', width: '18px', height: '18px' }} currency={currency1} /> */}
                </RowFixed>
            </FixedHeightRow>

            <FixedHeightRow>
              <Text fontSize={14} fontWeight={400}>
                Your pool share:
              </Text>
              <Text fontSize={14} fontWeight={400}>
                poolTokenPercentage
              </Text>
            </FixedHeightRow>
            <Pdnbap />
            {/* <ButtonSecondary padding="8px" borderRadius="8px">
              <ExternalLink
                style={{ width: '100%', textAlign: 'center', fontSize: '12px' }}
                href={`https://uniswap.info/account/${account}`}
              >
                View accrued fees and analytics<span style={{ fontSize: '11px' }}>↗</span>
              </ExternalLink>
            </ButtonSecondary> */}
              <RowBetween marginTop="10px">
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  as={Link}
                  to={`/add/farm`}
                  width="48%"
                >
                  Stake
                </ButtonPrimary>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  as={Link}
                  width="48%"
                  to={`/remove/farm`}
                >
                  Unstake
                </ButtonPrimary>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                as={Link}
                to={`/un/`}
                width="100%"
              >
                Manage Liquidity in Rewards Pool
              </ButtonPrimary>
          </AutoColumn>
        )}
      </AutoColumn>
    </StyledPositionCard>
    </>


    // <>
        
    //     <GreyCard>
    //       <AutoColumn gap="12px">
    //         <FixedHeightRow>
    //           <RowFixed>
    //             <Text fontWeight={500} fontSize={14}>
    //             {farm.token.symbol}
                  
    //             </Text>
    //           </RowFixed>
    //         </FixedHeightRow>
    //         <FixedHeightRow >
    //           <RowFixed>
    //             {/* <DoubleCurrencyLogo currency0={2} currency1={currency1} margin={true} size={18} /> */}
    //             <Text fontWeight={500} fontSize={18} style={{ marginLeft: "0.5rem" }}> 
    //              {farm.lpSymbol}
    //             </Text>
    //           </RowFixed>
    //           <RowFixed>
    //             <Text fontWeight={500} fontSize={18}>
    //             {farm.lpAddresses[3]}
    //             </Text>
    //           </RowFixed>
    //         </FixedHeightRow>
    //         <AutoColumn gap="4px">
    //           <FixedHeightRow>
    //             <Text fontSize={14} fontWeight={400}>
    //               Your pool share:
    //             </Text>
    //             <Text fontSize={14} fontWeight={400}>
    //               {/* {poolTokenPercentage ? poolTokenPercentage.toFixed(6) + '%' : '-'} */}
    //             </Text>
    //           </FixedHeightRow>
    //           {/* <FixedHeightRow>
    //             <Text fontSize={14} fontWeight={400}>
    //               {currency0.symbol}:
    //             </Text>
    //             {token0Deposited ? (
    //               <RowFixed>
    //                 <Text fontSize={14} fontWeight={400} marginLeft={'6px'}>
    //                   {token0Deposited?.toSignificant(6)}
    //                 </Text>
    //               </RowFixed>
    //             ) : (
    //               '-'
    //             )}
    //           </FixedHeightRow>
    //           <FixedHeightRow>
    //             <Text fontSize={14} fontWeight={400}>
    //               {currency1.symbol}:
    //             </Text>
    //             {token1Deposited ? (
    //               <RowFixed>
    //                 <Text fontSize={14} fontWeight={400} marginLeft={'6px'}>
    //                   {token1Deposited?.toSignificant(6)}
    //                 </Text>
    //               </RowFixed>
    //             ) : (
    //               '-'
    //             )}
    //           </FixedHeightRow> */}
    //         </AutoColumn>
    //       </AutoColumn>
    //     </GreyCard>
    // </>
  )
}

export default function FullPositionCard({ pair, border, stakedBalance }: PositionCardProps) {
  const { account } = useActiveWeb3React()

  const currency0 = unwrappedToken(pair.token0)
  const currency1 = unwrappedToken(pair.token1)

  const [showMore, setShowMore] = useState(false)

  const userDefaultPoolBalance = useTokenBalance(account ?? undefined, pair.liquidityToken)
  const totalPoolTokens = useTotalSupply(pair.liquidityToken)

  // if staked balance balance provided, add to standard liquidity amount
  const userPoolBalance = stakedBalance ? userDefaultPoolBalance?.add(stakedBalance) : userDefaultPoolBalance

  const poolTokenPercentage =
    !!userPoolBalance && !!totalPoolTokens && JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? new Percent(userPoolBalance.raw, totalPoolTokens.raw)
      : undefined

  const [token0Deposited, token1Deposited] =
    !!pair &&
    !!totalPoolTokens &&
    !!userPoolBalance &&
    // this condition is a short-circuit in the case where useTokenBalance updates sooner than useTotalSupply
    JSBI.greaterThanOrEqual(totalPoolTokens.raw, userPoolBalance.raw)
      ? [
          pair.getLiquidityValue(pair.token0, totalPoolTokens, userPoolBalance, false),
          pair.getLiquidityValue(pair.token1, totalPoolTokens, userPoolBalance, false)
        ]
      : [undefined, undefined]

  const backgroundColor = useColor(pair?.token0)

  return (
    <>
    {/* <StyledPositionHead>
      <StyleRow>Pair</StyleRow>
      <StyleRow>APR</StyleRow>
      <StyleRow>TVL</StyleRow>
      <StyleRow>Volume 24H</StyleRow>
    </StyledPositionHead>
    
    <StyledPositionBody>
      <StyleRow>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={20} />
        <Text fontWeight={500} fontSize={20}>
          {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
        </Text>
      </StyleRow>
      <StyleRow>APR</StyleRow>
      <StyleRow>TVL</StyleRow>
      <StyleRow>Volume 24H</StyleRow>
    </StyledPositionBody> */}

    <StyledPositionCard border={border} bgColor={backgroundColor}>
      <CardNoise />
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow gap="8px">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={18} />
            <Pooltext>
              {!currency0 || !currency1 ? <Dots>Loading</Dots> : `${currency0.symbol}/${currency1.symbol}`}
            </Pooltext>
          </AutoRow>
          <RowFixed gap="8px">
            <ButtonEmpty
              padding="6px 8px"
              borderRadius="12px"
              width="130px"
              fontSize={14}
              style={{ textAlign: 'right' }}
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? (
                <>
                  Manage
                  <ChevronUp size="16" style={{ marginLeft: '0.25rem' }} />
                </>
              ) : (
                <>
                  Manage
                  <ChevronDown size="16" style={{ marginLeft: '0.25rem' }} />
                </>
              )}
            </ButtonEmpty>
          </RowFixed>
        </FixedHeightRow>

        {showMore && (
          <AutoColumn gap="8px">
            <Pdnbap />
            <FixedHeightRow >
              <Text fontSize={14} fontWeight={400}>
                Your total pool tokens:
              </Text>
              <Text fontSize={14} fontWeight={400}>
                {userPoolBalance ? userPoolBalance.toSignificant(4) : '-'}
              </Text>
            </FixedHeightRow>
            {stakedBalance && (
              <FixedHeightRow>
                <Text fontSize={14} fontWeight={400}>
                  Pool tokens in rewards pool:
                </Text>
                <Text fontSize={14} fontWeight={400}>
                  {stakedBalance.toSignificant(4)}
                </Text>
              </FixedHeightRow>
            )}
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={14} fontWeight={400}>
                  Pooled {currency0.symbol}:
                </Text>
              </RowFixed>
              {token0Deposited ? (
                <RowFixed>
                  <Text fontSize={14} fontWeight={400} marginLeft={'6px'}>
                    {token0Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="16px" style={{ marginLeft: '8px', width: '18px', height: '18px' }} currency={currency0} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={14} fontWeight={400}>
                  Pooled {currency1.symbol}:
                </Text>
              </RowFixed>
              {token1Deposited ? (
                <RowFixed>
                  <Text fontSize={14} fontWeight={500} marginLeft={'6px'}>
                    {token1Deposited?.toSignificant(6)}
                  </Text>
                  <CurrencyLogo size="16px" style={{ marginLeft: '8px', width: '18px', height: '18px' }} currency={currency1} />
                </RowFixed>
              ) : (
                '-'
              )}
            </FixedHeightRow>

            <FixedHeightRow>
              <Text fontSize={14} fontWeight={400}>
                Your pool share:
              </Text>
              <Text fontSize={14} fontWeight={400}>
                {poolTokenPercentage
                  ? (poolTokenPercentage.toFixed(2) === '0.00' ? '<0.01' : poolTokenPercentage.toFixed(2)) + '%'
                  : '-'}
              </Text>
            </FixedHeightRow>
            <Pdnbap />
            {/* <ButtonSecondary padding="8px" borderRadius="8px">
              <ExternalLink
                style={{ width: '100%', textAlign: 'center', fontSize: '12px' }}
                href={`https://uniswap.info/account/${account}`}
              >
                View accrued fees and analytics<span style={{ fontSize: '11px' }}>↗</span>
              </ExternalLink>
            </ButtonSecondary> */}
            {userDefaultPoolBalance && JSBI.greaterThan(userDefaultPoolBalance.raw, BIG_INT_ZERO) && (
              <RowBetween marginTop="10px">
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  as={Link}
                  to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                  width="48%"
                >
                  Add
                </ButtonPrimary>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  as={Link}
                  width="48%"
                  to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                >
                  Remove
                </ButtonPrimary>
              </RowBetween>
            )}
            {stakedBalance && JSBI.greaterThan(stakedBalance.raw, BIG_INT_ZERO) && (
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                as={Link}
                to={`/uni/${currencyId(currency0)}/${currencyId(currency1)}`}
                width="100%"
              >
                Manage Liquidity in Rewards Pool
              </ButtonPrimary>
            )}
          </AutoColumn>
        )}
      </AutoColumn>
    </StyledPositionCard>
    </>
  )
}