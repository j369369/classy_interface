import { ChainId, TokenAmount } from '@uniswap/sdk'
import React, { useState } from 'react'
//import { Text } from 'rebass'
import { NavLink } from 'react-router-dom'
//import { darken } from 'polished'
import { useTranslation } from 'react-i18next'

import styled from 'styled-components'

import Logo from '../../assets/images/com/logo.svg'
/*
import Logo from '../../assets/svg/logo.svg'
import LogoDark from '../../assets/svg/logo_white.svg'
*/
import { useActiveWeb3React } from '../../hooks'
//import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances, useAggregateUniBalance } from '../../state/wallet/hooks'
import { CardNoise } from '../earn/styled'
import { CountUp } from 'use-count-up'
import { TYPE } from '../../theme'

import { YellowCard } from '../Card'
//import { Moon, Sun } from 'react-feather'
//import Menu from '../Menu'

//import Row from '../Row'
import Web3Status from '../Web3Status'
import ClaimModal from '../claim/ClaimModal'
import { useToggleSelfClaimModal, useShowClaimPopup } from '../../state/application/hooks'
import { useUserHasAvailableClaim } from '../../state/claim/hooks'
import { useUserHasSubmittedClaim } from '../../state/transactions/hooks'
import { Dots } from '../swap/styleds'
import Modal from '../Modal'
import UniBalanceContent from './UniBalanceContent'
import usePrevious from '../../hooks/usePrevious'

const HeaderFrame = styled.header``
const HeaderControls = styled.div``
const HeaderElement = styled.div``
const HeaderLinks = styled.ul``
const StyledNavLink = styled(NavLink)``

const HideSmall = styled.span``

const NetworkCard = styled(YellowCard)`
  border-radius: 12px;
  padding: 8px 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
`

const BalanceText = styled.strong``

const AccountElement = styled.div<{ active: boolean }>``

const UNIAmount = styled(AccountElement)`
  color: white;
  padding: 4px 8px;
  height: 36px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
`

const UNIWrapper = styled.span`
  width: fit-content;
  position: relative;
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.9;
  }
`

export const StyledMenuButton = styled.button`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  margin-left: 8px;
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;
  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }
  svg {
    margin-top: 2px;
  }
  > * {
    stroke: ${({ theme }) => theme.text1};
  }
`


const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan'
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
    <HeaderFrame id={`header`}>
      <section className="header_in">
        <article className="close_btn"><i className="fas fa-times"></i></article>
        <article className="logo">
          <StyledNavLink to={'/swap'}>
            <img src={Logo} alt="logo" />
          </StyledNavLink>
        </article>
        <HeaderLinks className={`menu_list`}>
          <li className="li">
            <StyledNavLink to={'/swap'}>
              <i className="fas fa-exchange-alt"></i>
              <span className="text">{t('swap')}</span>
            </StyledNavLink>
          </li>
          <li className="li">
            <StyledNavLink to={'/pool'}
                isActive={(match, { pathname }) =>
                Boolean(match) ||
                pathname.startsWith('/add') ||
                pathname.startsWith('/remove') ||
                pathname.startsWith('/create') ||
                pathname.startsWith('/find')
              }
            >
              <i className="fas fa-disease"></i>
              <span className="text">{t('pool')}</span>
            </StyledNavLink>
          </li>
        </HeaderLinks>
        <HeaderControls className={`bottom_contents`}>
          <div className="connect">
            <Web3Status />
          </div>
          <AccountElement className={`signout`} active={!!account}>
            <section className="wallet">
              <HeaderElement className={`wallet_code`} onClick={() => setShowUniBalanceModal(true)}>
                <span className="ic_code"><i className="fas fa-shield-alt"></i></span>
                <span id="walletStr">0xF94a ..... bbddaa</span>
              </HeaderElement>
                <article className="wallet_info">
                  <ul className="wallet_list">
                    <li className="li">
                      {account && userEthBalance ? (
                          <BalanceText className={`w_num`}>
                            {userEthBalance?.toSignificant(4)}
                          </BalanceText>
                      ) : null}
                      <span className="w_unit">ETH</span>
                    </li>
                    <li className="li">
                      <strong className="w_num">11.475</strong>
                      <span className="w_unit">CLSY</span>
                    </li>
                  </ul>
                </article>
              </section>
              <button type="button" id="btnSignOut" className="button blue06">Sign Out</button>
          </AccountElement>
            <div id="footer"> 
              <section className="footer_sns">
              <StyledNavLink className={`link`} to={'javascript:;'}>
                <i className="fab fa-instagram"></i>
              </StyledNavLink>
              <StyledNavLink className={`link`} to={'javascript:;'}>
                <i className="fab fa-twitter"></i>
              </StyledNavLink>
              <StyledNavLink className={`link`} to={'javascript:;'}>
                <i className="fab fa-facebook"></i>
              </StyledNavLink>
              </section>
              <section className="footer_address">
                © 2021 Classy
              </section>
            </div>
        </HeaderControls>
      </section>


      <ClaimModal />
      <Modal isOpen={showUniBalanceModal} onDismiss={() => setShowUniBalanceModal(false)}>
        <UniBalanceContent setShowUniBalanceModal={setShowUniBalanceModal} />
      </Modal>
      <HeaderControls>
        <HeaderElement>
          <HideSmall>
            {chainId && NETWORK_LABELS[chainId] && (
              <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
            )}
          </HideSmall>
          {availableClaim && !showClaimPopup && (
            <UNIWrapper onClick={toggleClaimModal}>
              <UNIAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                <TYPE.white padding="0 2px">
                  {claimTxn && !claimTxn?.receipt ? <Dots>Claiming UNI</Dots> : 'Claim UNI'}
                </TYPE.white>
              </UNIAmount>
              <CardNoise />
            </UNIWrapper>
          )}
          {!availableClaim && aggregateBalance && (
            <UNIWrapper onClick={() => setShowUniBalanceModal(true)}>
              <UNIAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                {account && (
                  <HideSmall>
                    <TYPE.white
                      style={{
                        paddingRight: '.4rem'
                      }}
                    >
                      <CountUp
                        key={countUpValue}
                        isCounting
                        start={parseFloat(countUpValuePrevious)}
                        end={parseFloat(countUpValue)}
                        thousandsSeparator={','}
                        duration={1}
                      />
                    </TYPE.white>
                  </HideSmall>
                )}
                CLSY
              </UNIAmount>
              <CardNoise />
            </UNIWrapper>
          )}
        </HeaderElement>
      </HeaderControls>
    </HeaderFrame>
  )
}
