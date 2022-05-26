import { Currency, Percent, Price } from '@uniswap/sdk'
import React, { useContext } from 'react'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { AutoColumn } from '../../components/Column'
import { AutoRow } from '../../components/Row'
import { ONE_BIPS } from '../../constants'
import { Field } from '../../state/mint/actions'
import { TYPE } from '../../theme'

export function PoolPriceBar({
  currencies,
  noLiquidity,
  poolTokenPercentage,
  price
}: {
  currencies: { [field in Field]?: Currency }
  noLiquidity?: boolean
  poolTokenPercentage?: Percent
  price?: Price
}) {
  const theme = useContext(ThemeContext)
  return (
    <>
    <div className="info_list">
      <ul className="swap_info">
        <li>
          <div className="info_title">
            <strong>{currencies[Field.CURRENCY_B]?.symbol}</strong> per <strong>{currencies[Field.CURRENCY_A]?.symbol}</strong>
          </div>
          <div className="info_contents">
            <span className="num">{price?.toSignificant(6) ?? '-'}</span>
          </div>
        </li>
        <li>
          <div className="info_title">
            <strong>{currencies[Field.CURRENCY_A]?.symbol}</strong> per <strong>{currencies[Field.CURRENCY_B]?.symbol}</strong>
          </div>
          <div className="info_contents">
            <span className="num">{price?.invert()?.toSignificant(6) ?? '-'}</span>
          </div>
        </li>
        <li>
          <div className="info_title">
            Share of Pool
          </div>
          <div className="info_contents">
            <span className="num">
              {noLiquidity && price
                ? '100'
                : (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
              %
            </span>
          </div>
        </li>
      </ul>
    </div>
    </>
  )
}
