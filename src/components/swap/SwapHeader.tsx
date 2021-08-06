import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { RowBetween } from '../Row'
//import { TYPE } from '../../theme'

const StyledSwapHeader = styled.div`
  padding: 12px 1rem 0px 1.5rem;
  margin-bottom: -4px;
  width: 100%;
`

const SwapHeaderTitle = styled.strong`
  color: var(--blue-05);
  font-size: 1rem;
  font-weight: 500;
`

const Setting = styled.span`
  color: var(--blue-05);
  font-weight: 500;

  svg > * {
    color: var(--blue-05);
    stroke: var(--blue-05);
  }
`

export default function SwapHeader() {
  return (
    <StyledSwapHeader>
      <RowBetween>
        <SwapHeaderTitle>Trade tokens in a instant</SwapHeaderTitle>
        <Setting>
          <Settings />
        </Setting>
      </RowBetween>
    </StyledSwapHeader>
  )
}
