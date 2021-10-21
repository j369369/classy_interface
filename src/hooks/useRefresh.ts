import { useContext } from 'react'
import { RefreshContext } from 'utils/RefreshContext'

const useRefresh = () => {
  const { fast, slow } = useContext(RefreshContext)
  return { fastRefresh: fast, slowRefresh: slow }
}

export default useRefresh
