import React from 'react'
import styled from 'styled-components'

import { FarmConfig } from '../../constants/farm/types'

import RowProps from './types'
import {useAverageBlockTime} from 'hooks/useBlockPerDay'
import { Dots } from '../swap/styleds'
import { CURRENCIES } from '../../constants/index';


const Pooltext = styled.span`
  font-size: 18px;
  font-weight: 500;
  @media(max-width: 768px) {
    font-size: 16px;
  }
  width : 20%;
`

  export interface ITableProps {
    data: RowProps
    userDataReady: boolean
  }

const FarmTable: React.FC<ITableProps> = (props) => {

    const { data,  userDataReady } = props
    const averageBlockTime = useAverageBlockTime()
    const blocksPerDay = 86400 / Number(averageBlockTime)
    const rewardPerDay = blocksPerDay * Number(data.details.rewardPerBlock)

    return (
         <>
         <ul className="farm_card_list_info">
          <li className="li">
            <div className="farm_card_list_title">TVL</div>
            <div className="farm_card_list_text">
              <strong className="num">
              {!Number(data.details.liquidity) ? '-' : (
                <>${Number(data.details.liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}</>
              )} 
              </strong>
            </div>
          </li>
          <li className="li">
            <div className="farm_card_list_title">Rewards</div>
            <div className="farm_card_list_text">
              <strong className="num">
                {!Number(data.details.liquidity) ? '-' : (
                  <>{rewardPerDay.toLocaleString(undefined, { maximumFractionDigits: 0 })} {CURRENCIES} / DAY</>
                )}
              </strong>
            </div>
          </li>
          <li className="li">
            <div className="farm_card_list_title">APR</div>
            <div className="farm_card_list_text">
              <strong className="num">
                {!Number(data.details.liquidity) ? '-' : (
                  <>{data.apr.value} %</>
                )}
              </strong>
            </div>
          </li>
        </ul>
        {/* 
          {!Number(data.details.liquidity) ? <Dots>Loading</Dots> : 
          <>
          <Pooltext>
          ${Number(data.details.liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          {/* `$${Number(liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        </Pooltext>

        <Pooltext>
         {rewardPerDay.toLocaleString(undefined, { maximumFractionDigits: 0 })} {CURRENCIES} / DAY
        </Pooltext>

        <Pooltext>
           {data.apr.value} %
        </Pooltext>
        </>
          }
        */}
     </>
    )
}

export default FarmTable


// export default function renderReward(row: RowProps) {

// const pid = row?.pid


//   return (
//     <>
//             <Pooltext>
//               TVL
//               ${pid}
//             </Pooltext>

//             <Pooltext>
//             Rewards
//             </Pooltext>

//             <Pooltext>
//               APR
//               {getDisplayApr(farm?.apr, farm.lpRewardsApr)}
//             </Pooltext>
//     </>
//   )
// }
