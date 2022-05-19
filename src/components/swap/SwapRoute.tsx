import { Trade } from '@uniswap/sdk'
import React, { Fragment, memo, useContext } from 'react'
import { ChevronRight } from 'react-feather'
import { Flex } from 'rebass'
import { ThemeContext } from 'styled-components'
import { TYPE } from '../../theme'
import { unwrappedToken } from 'utils/wrappedCurrency'

export default memo(function SwapRoute({ trade }: { trade: Trade }) {
  const theme = useContext(ThemeContext)
  return (
    <div className="dis_flex gap4">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = unwrappedToken(token)
        return (
          <>
            <strong>{currency.symbol}</strong>
            {isLastItem ? null :<span className="text gray"><i className="fas fa-long-arrow-alt-right"></i> </span>}
          </>
        )
      })}
    </div>
  )
})
