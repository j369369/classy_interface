import { Trade, TradeType } from '@uniswap/sdk'
import React, { useContext, useMemo, useState } from 'react'
import { Repeat } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import {
  computeSlippageAdjustedAmounts,
  computeTradePriceBreakdown,
  formatExecutionPrice,
  warningSeverity
} from '../../utils/prices'
import { ButtonError } from '../Button'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import { StyledBalanceMaxMini, SwapCallbackError } from './styleds'

export default function SwapModalFooter({
  trade,
  onConfirm,
  allowedSlippage,
  swapErrorMessage,
  disabledConfirm
}: {
  trade: Trade
  allowedSlippage: number
  onConfirm: () => void
  swapErrorMessage: string | undefined
  disabledConfirm: boolean
}) {
  const [showInverted, setShowInverted] = useState<boolean>(false)
  const theme = useContext(ThemeContext)
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    allowedSlippage,
    trade
  ])
  const { priceImpactWithoutFee, realizedLPFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const severity = warningSeverity(priceImpactWithoutFee)

  return (
    <>
      <section className="swap_info_box">
        <ul className="swap_info">
            <li>
              <div className="info_title">
                <span className="yellow_title">Price</span>
              </div>
              <div className="info_contents">
                <span className="num">{formatExecutionPrice(trade, showInverted)}</span>
                <StyledBalanceMaxMini onClick={() => setShowInverted(!showInverted)}>
                  <Repeat size={14} />
              </StyledBalanceMaxMini>
              </div>
            </li>
        </ul>
        <ul className="swap_info">
          <li>
            <div className="info_title">
              {trade.tradeType === TradeType.EXACT_INPUT ? 'Minimum received' : 'Maximum sold'}
              <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
            </div>
            <div className="info_contents">
              <span className="num">
                {trade.tradeType === TradeType.EXACT_INPUT
                ? slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'
                : slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'}
              </span>
              <span className="symbol">
                {trade.tradeType === TradeType.EXACT_INPUT
                  ? trade.outputAmount.currency.symbol
                  : trade.inputAmount.currency.symbol}
              </span>
            </div>
          </li>
          <li>
            <div className="info_title">
              Price Impact
              <QuestionHelper text="The difference between the market price and your price due to trade size." />
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
                  <span className="num">{realizedLPFee?.toSignificant(6)}</span>
                  <span className="symbol">{trade.inputAmount.currency.symbol}</span>
                </>
              ) : '-'}
            </div>
          </li>
        </ul>
      </section>
      <AutoRow>
        {/* <button 
        type="button" 
        className="button round sm tropical"
        onClick={onConfirm}
        >
          {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
        </button> */}
        <ButtonError
          onClick={onConfirm}
          disabled={disabledConfirm}
          error={severity > 2}
          className="button round lg tropical"
        >
          {severity > 2 ? 'Swap Anyway' : 'Confirm Swap'}
        </ButtonError>

        {swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
      </AutoRow>
    </>
  )
}
