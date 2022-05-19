import { Trade, TradeType } from '@uniswap/sdk'
import React, { useContext, useMemo } from 'react'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { TYPE } from '../../theme'
import { ButtonPrimary } from '../Button'
import { isAddress, shortenAddress } from '../../utils'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
import CurrencyLogo from '../CurrencyLogo'
import { RowBetween, RowFixed } from '../Row'
import { TruncatedText, SwapShowAcceptChanges } from './styleds'

export default function SwapModalHeader({
  trade,
  allowedSlippage,
  recipient,
  showAcceptChanges,
  onAcceptChanges
}: {
  trade: Trade
  allowedSlippage: number
  recipient: string | null
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const slippageAdjustedAmounts = useMemo(() => computeSlippageAdjustedAmounts(trade, allowedSlippage), [
    trade,
    allowedSlippage
  ])
  const { priceImpactWithoutFee } = useMemo(() => computeTradePriceBreakdown(trade), [trade])
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const theme = useContext(ThemeContext)

  return (
    <>
      <section className="swap_card_wrap">
        <div className="swap_card_head">
          <h5 className="swap_card_head_token_name">{trade.inputAmount.currency.symbol}</h5>
          <article className="swap_card_head_logo">
            <div className="img_logo to">
              <CurrencyLogo currency={trade.inputAmount.currency} />
            </div>
            <div className="line"></div>
            <div className="img_logo from">
              <CurrencyLogo currency={trade.outputAmount.currency} />
            </div>
          </article>
          <h5 className="swap_card_head_token_name">{trade.outputAmount.currency.symbol}</h5>
        </div>
        <div className="swap_card_body">
          <section className="swap_card_body_token_wrap">
            <dl className="swap_card_body_token">
              <dt className="swap_card_body_token_name">{trade.inputAmount.currency.symbol}</dt>
              <dd className="swap_card_body_token_value">{trade.inputAmount.toSignificant(6)}</dd>
            </dl>
            <dl className="swap_card_body_token right">
              <dt className="swap_card_body_token_name">{trade.outputAmount.currency.symbol}</dt>
              <dd className="swap_card_body_token_value">{trade.outputAmount.toSignificant(6)}</dd>
            </dl>
          </section>
          <section className="swap_card_body_info_wrap text gray">
            {trade.tradeType === TradeType.EXACT_INPUT ? (
              <p className="text sm">
                Output is estimated. You will receive at least 
                <strong className="text white"> <span className="f_cookie">{slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(6)}</span> {trade.outputAmount.currency.symbol}</strong>
                or the transaction will revert.
              </p>
            ) : (
              <p className="text sm">
                Input is estimated. You will sell at most 
                <strong className="text white"> <span className="f_cookie">{slippageAdjustedAmounts[Field.INPUT]?.toSignificant(6)}</span> {trade.inputAmount.currency.symbol} </strong>
                or the transaction will revert.
              </p>
            )}
          </section>
          {showAcceptChanges && (
            <section className="dis_flex between">
              <h6 className="text pink">Price Updated</h6>
              <button className="button pink" onClick={onAcceptChanges}>
                Accept
              </button>
            </section>
          )}
          {recipient && (
            <section className="dis_flex_col text sm yellow">
              <p>Output will be sent to <strong className="text white">{isAddress(recipient) ? shortenAddress(recipient) : recipient}</strong></p>
            </section>
          )}
        </div>
      </section>
    </>
  )
}
