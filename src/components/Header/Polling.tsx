import React, { useState, useEffect } from 'react'
import { useBlockNumber } from '../../state/application/hooks'
import { getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'

export default function Polling() {
  const { chainId } = useActiveWeb3React()

  const blockNumber = useBlockNumber()

  const [isMounted, setIsMounted] = useState(true)

  useEffect(
    () => {
      const timer1 = setTimeout(() => setIsMounted(true), 1000)

      // this will clear Timeout when component unmount like in willComponentUnmount
      return () => {
        setIsMounted(false)
        clearTimeout(timer1)
      }
    },
    [blockNumber] //useEffect will run only one time
    //if you pass a value to array, like this [data] than clearTimeout will run every time this value changes (useEffect re-run)
  )

  return (
    <a 
      className='polling'
      href={chainId && blockNumber ? getEtherscanLink(chainId, blockNumber.toString(), 'block') : ''}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
        <span className={'' + isMounted && 'isMounted' }>{blockNumber}</span>
        <span className='dot'>{!isMounted && <div className="spinner" />}</span>
    </a>
  )
}
