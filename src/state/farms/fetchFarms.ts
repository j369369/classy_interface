import { FarmConfig } from 'constants/farm/types'
import fetchFarm from './fetchFarm'

const fetchFarms = async (farmsToFetch: FarmConfig[]) => {
  const data = await Promise.all(
    farmsToFetch.map(async (farmConfig) => {
      const farm = await fetchFarm(farmConfig)
      return farm
    }),
  )
  return data
}

export default fetchFarms
