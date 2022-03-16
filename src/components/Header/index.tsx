import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChainId, TokenAmount } from '@uniswap/sdk'

import { CountUp } from 'use-count-up'

import Web3Status from '../Web3Status'
import { useActiveWeb3React } from '../../hooks'
import { useETHBalances, useAggregateUniBalance } from '../../state/wallet/hooks'
import { useToggleSelfClaimModal, useShowClaimPopup } from '../../state/application/hooks'
import { useUserHasAvailableClaim } from '../../state/claim/hooks'
import { useUserHasSubmittedClaim } from '../../state/transactions/hooks'
import UniBalanceContent from './UniBalanceContent'
import usePrevious from '../../hooks/usePrevious'

import Polling from './Polling'
import URLWarning from './URLWarning'
import ClaimModal from '../claim/ClaimModal'
import { CardNoise } from '../earn/styled'
import { TYPE } from '../../theme'

import Modal from '../Modal'

// import { Dots } from '../swap/styleds'
import Logo from '../../assets/images/com/logo.svg'

import './Header.css'

/*
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { Text } from 'rebass'
import { darken } from 'polished'
import { useDarkModeManager } from '../../state/user/hooks'

import { YellowCard } from '../Card'
import { Moon, Sun } from 'react-feather'
import Menu from '../Menu'
import Row from '../Row'

import Logo from '../../assets/svg/logo.svg'
import LogoDark from '../../assets/svg/logo_white.svg'
*/





const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  // [ChainId.RINKEBY]: 'Rinkeby',
  // [ChainId.ROPSTEN]: 'Ropsten',
  // [ChainId.GÖRLI]: 'Görli',
  // [ChainId.KOVAN]: 'Kovan'
  [ChainId.MATIC]: 'Matic',
  [ChainId.MUMBAI]: 'Mumbai'

}

export default function Header() {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()

  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  // const [isDark] = useDarkModeManager()
  //const [darkMode, toggleDarkMode] = useDarkModeManager()

  const toggleClaimModal = useToggleSelfClaimModal()

  const availableClaim: boolean = useUserHasAvailableClaim(account)

  const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined)

  const aggregateBalance: TokenAmount | undefined = useAggregateUniBalance()

  const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)
  const showClaimPopup = useShowClaimPopup()

  const countUpValue = aggregateBalance?.toFixed(0) ?? '0'
  const countUpValuePrevious = usePrevious(countUpValue) ?? '0'

  return (
    <>
      <header id='header'>
        <NavLink to={'/swap'} className="header_logo">
          <img src={Logo} alt="logo" />
        </NavLink>
        <div className="header_connect">
          <Web3Status />
        </div>
        {account && (
          <div className="header_info">
              <Polling />
              <ul className="wallet_list">
                {account && userEthBalance ? (
                  <li>
                      <span>{ userEthBalance?.toSignificant(4) }</span>
                      <span> { userEthBalance?.currency.symbol }</span>
                  </li>
                ) : null}

                {!availableClaim && aggregateBalance && (
                  <li>
                    {(!!account && !availableClaim) && (
                      <div onClick={() => setShowUniBalanceModal(true)}>
                        <span>
                            <CountUp
                              key={countUpValue}
                              isCounting
                              start={parseFloat(countUpValuePrevious)}
                              end={parseFloat(countUpValue)}
                              thousandsSeparator={','}
                              duration={1}
                            />
                        </span>
                        <span> { aggregateBalance?.currency.symbol }</span>
                      </div>
                    )}
                  </li>
                )}
              </ul>
              <section className="network">
                {chainId && NETWORK_LABELS[chainId] && 
                    <>
                      Network : <span title={NETWORK_LABELS[chainId]} className="text yellow">{NETWORK_LABELS[chainId]}</span>
                    </>
                }
              </section>
          </div>
        )}
      </header>
      <URLWarning />
      <ClaimModal />
      <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
        <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
      </Modal>
    </>
  )
}
