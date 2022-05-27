import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk'
import React from 'react'
import { Text } from 'rebass'
import { ButtonPrimary } from '../../components/Button'
import { RowBetween, RowFixed } from '../../components/Row'
import CurrencyLogo from '../../components/CurrencyLogo'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'

export function ConfirmAddModalBottom({
  noLiquidity,
  price,
  currencies,
  parsedAmounts,
  poolTokenPercentage,
  onAdd
}: {
  noLiquidity?: boolean
  price?: Fraction
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount }
  poolTokenPercentage?: Percent
  onAdd: () => void
}) {
  return (
    <section className="swap_info_box">
      <ul className="swap_info">
        <li>
          <div className="info_title"><strong>{currencies[Field.CURRENCY_A]?.symbol}</strong> Deposited</div>
          <div className="info_contents">
            <span className="num">{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</span>
          </div>
        </li>
        <li>
          <div className="info_title">{currencies[Field.CURRENCY_B]?.symbol} Deposited</div>
          <div className="info_contents">
            <span className="num">{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</span>
          </div>
        </li>
        <li>
          <div className="info_title">Rates</div>
          <div className="info_contents">
            <section>
              <span className="num">1 </span>
              <span className="symbol">{currencies[Field.CURRENCY_A]?.symbol}</span> = <span className="num">{price?.toSignificant(4)} </span>
              <span className="symbol">{currencies[Field.CURRENCY_B]?.symbol}</span>
            </section>
            <section>
              <span className="num">1 </span>
              <span className="symbol">{currencies[Field.CURRENCY_B]?.symbol}</span> = <span className="num">{price?.invert().toSignificant(4)} </span>
              <span className="symbol">{currencies[Field.CURRENCY_A]?.symbol}</span>
            </section>
          </div>
        </li>
        <li>
          <div className="info_title">Share of Pool</div>
          <div className="info_contents">
            <span className="num">{noLiquidity ? '100' : poolTokenPercentage?.toSignificant(4)}%</span>
          </div>
        </li>
      </ul>
      <div className="swap_button_box">
        <button type="button" className={`button round lg ${noLiquidity ? "line error" : "samba"} w100p`} 
          onClick={onAdd}
        >
          {noLiquidity ? 'Create Pool & Supply' : 'Confirm Supply'}
        </button>
      </div>
    </section>
  )
}
