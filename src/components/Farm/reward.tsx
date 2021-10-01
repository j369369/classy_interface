import React from 'react'
import styled from 'styled-components'

import { FarmConfig } from '../../constants/farm/types'


interface FarmsProps {
  farm?: FarmConfig
}
const Pooltext = styled.span`
  font-size: 18px;
  font-weight: 500;
  @media(max-width: 768px) {
    font-size: 16px;
  }
  width : 20%;
`

export default function renderReward({
  farm
}: FarmsProps) {

const pid = farm?.pid


  return (
    <>
            <Pooltext>
              TVL
              ${pid}
            </Pooltext>

            <Pooltext>
            Rewards
            </Pooltext>

            <Pooltext>
              APR
            </Pooltext>
    </>
  )
}
