import React from 'react'
import styled from 'styled-components'
import { useLastTruthy } from '../../hooks/useLast'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

export default function AdvancedSwapDetailsDropdown({ trade, ...rest }: AdvancedSwapDetailsProps) {
  const lastTrade = useLastTruthy(trade)

  return (
    // <AdvancedDetailsFooter show={Boolean(trade)}>
    <div className="info_list">
      <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
    </div>
  )
}
