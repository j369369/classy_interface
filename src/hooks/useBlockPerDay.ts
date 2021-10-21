import { request } from 'graphql-request'
import { startOfHour, subDays, subHours } from 'date-fns'
import gql from 'graphql-tag'
import { ChainId } from '@uniswap/sdk'
import useSWR from 'swr'

import { useActiveWeb3React } from 'hooks'

const blockFieldsQuery = gql`
  fragment blockFields on Block {
    id
    number
    timestamp
  }
`

export const blocksQuery = gql`
  query blocksQuery($first: Int! = 1000, $skip: Int! = 0, $start: Int!, $end: Int!) {
    blocks(
      first: $first
      skip: $skip
      orderBy: number
      orderDirection: desc
      where: { timestamp_gt: $start, timestamp_lt: $end }
    ) {
      ...blockFields
    }
  }
  ${blockFieldsQuery}
`



export const fetcher = async (query :any, variables :any) => {
    return request(`https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks`, query, variables)
  }


  export const getBlocks = async (start:any, end:any) => {
    const { blocks } = await fetcher(blocksQuery, {
      start,
      end,
    })
    return blocks
  }

// Grabs the last 1000 (a sample statistical) blocks and averages
// the time difference between them
export const getAverageBlockTime = async (chainId = ChainId.MAINNET) => {
    // console.log('getAverageBlockTime')
    const now = startOfHour(Date.now())
    const start = Number(subHours(now, 6)) / 1000
    const end = Number(now) /1000

    const blocks = await getBlocks(start, end)
    const averageBlockTime = blocks?.reduce(
      (previousValue:any, currentValue:any, currentIndex:any) => {
        if (previousValue.timestamp) {
          const difference = previousValue.timestamp - currentValue.timestamp
  
          previousValue.averageBlockTime = previousValue.averageBlockTime + difference
        }
  
        previousValue.timestamp = currentValue.timestamp
  
        if (currentIndex === blocks.length - 1) {
          return previousValue.averageBlockTime / blocks.length
        }
  
        return previousValue
      },
      { timestamp: null, averageBlockTime: 0 }
    )
  
    return averageBlockTime
  }


  export function useAverageBlockTime(swrConfig = undefined) {
    const { chainId } = useActiveWeb3React()
  
    const { data } = useSWR(
      chainId ? ['averageBlockTime', chainId] : null,
      (_, chainId) => getAverageBlockTime(chainId),
      swrConfig
    )
  
    return data
  }