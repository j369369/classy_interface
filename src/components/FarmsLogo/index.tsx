import { Currency, ChainId } from '@uniswap/sdk'
import React from 'react'
import styled from 'styled-components'
import {TokenLogo} from '../CurrencyLogo'

import { FarmConfig, Address } from '../../constants/farm/types'


const Wrapper = styled.div<{ margin: boolean; sizeraw: number }>`
  position: relative;
  display: flex;
  flex-direction: row;
  //margin-right: ${({ sizeraw, margin }) => margin && (sizeraw / 3 + 8).toString() + 'px'};
`

interface FarmsLogoProps {
  margin?: boolean
  size?: number
  farm?: FarmConfig
}

const HigherLogo = styled(TokenLogo)`
  z-index: 2;
`
const CoveredLogo = styled(TokenLogo)<{ sizeraw: number }>`
  position: absolute;
  left: ${({ sizeraw }) => '-' + (sizeraw / 2).toString() + 'px'} !important;
`

const getAddress = (address: Address): string => {
  return address[ChainId.MAINNET]!
}

export default function FarmsLogo({
  farm,
  size = 16,
  margin = false
}: FarmsLogoProps) {
  return (
    
    <Wrapper sizeraw={size} margin={margin}>
      {farm?.token && <HigherLogo address={getAddress(farm?.token.address as any)} size={size.toString() + 'px'} />}
      {farm?.quoteToken && <CoveredLogo address={getAddress(farm?.quoteToken.address as any)} size={size.toString() + 'px'} sizeraw={size} />}
    </Wrapper>
  )
}
