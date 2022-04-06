import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
//import { darken } from 'polished'
import React, { useMemo } from 'react'
//import { Activity } from 'react-feather'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg'
import FortmaticIcon from '../../assets/images/fortmaticIcon.png'
import PortisIcon from '../../assets/images/portisIcon.png'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import { //fortmatic, portis, 
  injected, walletconnect, walletlink } from '../../connectors'
import { NetworkContextName } from '../../constants'
import useENSName from '../../hooks/useENSName'
import { useHasSocks } from '../../hooks/useSocksBalance'
import { useWalletModalToggle } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { shortenAddress } from '../../utils'
//import { ButtonSecondary } from '../Button'

import Identicon from '../Identicon'
// import Loader from '../Loader'

// import { RowBetween } from '../Row'
import WalletModal from '../WalletModal'


// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const SOCK = (
  <span role="img" aria-label="has socks emoji">
    🧦
  </span>
)

// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector }) {
  if (connector === injected) {
    return (
      <Identicon />
    )
  } else if (connector === walletconnect) {
    return (
      <img src={WalletConnectIcon} alt={''} />
    )
  } else if (connector === walletlink) {
    return (
      <img src={CoinbaseWalletIcon} alt={''} />
    )
  } 
  // else if (connector === fortmatic) {
  //   return (
  //     <IconWrapper size={12}>
  //       <img src={FortmaticIcon} alt={''} />
  //     </IconWrapper>
  //   )
  // } 
  // else if (connector === portis) {
  //   return (
  //     <IconWrapper size={12}>
  //       <img src={PortisIcon} alt={''} />
  //     </IconWrapper>
  //   )
  // }
  return null
}

function Web3StatusInner() {
  const { t } = useTranslation()
  const { account, connector, error } = useWeb3React()

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)

  const hasPendingTransactions = !!pending.length
  const hasSocks = useHasSocks()
  const toggleWalletModal = useWalletModalToggle()



  if (account) {
    return (
      <>
      <button id="btnConnected" className="button md dark4" onClick={toggleWalletModal}>
        <span className="col ic">
          {!hasPendingTransactions && connector && <StatusIcon connector={connector} />}
        </span>
        <span className="col">
          {hasPendingTransactions ? (
            <span className="blink">{pending?.length} Pending...</span>
          ) : (
            <>
              {hasSocks ? SOCK : null} {ENSName || shortenAddress(account)}
            </>
          )}
        </span>
      </button>
      </>
    )
  } else if (error) {
    return (
      <button className="button md red" onClick={toggleWalletModal}>
        <span className="blink">{error instanceof UnsupportedChainIdError ? 'Wrong Network' : 'Error'}</span>
      </button>
    )
  } else {
    return (
      <button id="btnConnectWallet" className="button md blue" onClick={toggleWalletModal}>
        <i className="fas fa-plug"></i> {t('Connect Wallet')}
      </button>
    )
  }
}

export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)

  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner />
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
}
