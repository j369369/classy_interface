import { Trade, TradeType } from '@uniswap/sdk'
import React/*, { useContext }*/ from 'react'
//import styled, { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE /*, ExternalLink*/ } from '../../theme'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'

// const InfoLink = styled(ExternalLink)`
//   width: 100%;
//   border: 1px solid ${({ theme }) => theme.bg3};
//   padding: 6px 6px;
//   border-radius: 8px;
//   text-align: center;
//   font-size: 14px;
//   color: ${({ theme }) => theme.text1};
// `

function TradeSummary({ trade, allowedSlippage }: { trade: Trade; allowedSlippage: number }) {
  //const theme = useContext(ThemeContext)
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  return (
    <>
      <li>
        <div className="info_title">
          {isExactIn ? 'Minimum received' : 'Maximum sold'}
          <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
        </div>
        
        <div className="info_contents">
          {isExactIn ? (
              <>
                <span className="num">{slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)}</span>
                <span className="symbol">{trade.outputAmount.currency.symbol}</span>
              </>
          ) ?? '-'
          : (
              <>
                <span className="num">{slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)}</span>
                <span className="symbol">{trade.inputAmount.currency.symbol}</span>
              </>
          ) ?? '-' }
          </div>
      </li>
      <li>
        <div className="info_title">
          Price Impact
          <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
        </div>
        <div className="info_contents">
          <span className="num">
            <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
          </span>
        </div>
      </li>
      <li>
        <div className="info_title">
          Liquidity Provider Fee
          <QuestionHelper text="A portion of each trade (0.30%) goes to liquidity providers as a protocol incentive." />
        </div>
        <div className="info_contents">
          
          {realizedLPFee ? (
            <>
              <span className="num">{realizedLPFee.toSignificant(4)}</span>
              <span className="symbol">{trade.inputAmount.currency.symbol}</span>
            </>
          ) : '-'}
        </div>
      </li>
    </>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  //const theme = useContext(ThemeContext)

  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 2)

  return (
    <ul className="swap_info">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <li>
              <div className="info_title">
              Route
                <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
              </div>
              <div className="info_contents">
                <span className="">
                  <SwapRoute trade={trade} />
                </span>
              </div>
            </li>
          )}
          {/* {!showRoute && (
            <AutoColumn style={{ padding: '12px 16px 0 16px' }}>
              <InfoLink
                href={'https://uniswap.info/pair/' + trade.route.pairs[0].liquidityToken.address}
                target="_blank"
              >
                View pair analytics ↗
              </InfoLink>
            </AutoColumn>
          )} */}
        </>
      )}
    </ul>
  )
}
