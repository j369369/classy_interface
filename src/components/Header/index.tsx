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

//import { YellowCard } from '../Card'
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
import gsap from 'gsap'


const HeaderFrame = styled.header``
const HeaderControls = styled.div``
const HeaderElement = styled.div``
const HeaderLinks = styled.ul``
const StyledNavLink = styled(NavLink)``

const HideSmall = styled.span``
const NetworkCard = styled.span``
const BalanceText = styled.strong``

const AccountElement = styled.div<{ active: boolean }>``
const CLSYAmount = styled(AccountElement)``
const CLSYWrapper = styled.span``

export const StyledMenuButton = styled.button``


const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  // [ChainId.RINKEBY]: 'Rinkeby',
  // [ChainId.ROPSTEN]: 'Ropsten',
  // [ChainId.GÖRLI]: 'Görli',
  // [ChainId.KOVAN]: 'Kovan'
  [ChainId.MATIC]: 'Matic',
  [ChainId.MUMBAI]: 'Mumbai'

}


const fn_btnHeaderClose = () => {
  const gsapHeader = gsap.timeline();
    gsapHeader
    .to("#header", { className: "", ease: "power4" })
    .to("#headerBg", { display:"none" , ease: "power4"}, '-=1');
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
        <article className="close_btn" onClick={fn_btnHeaderClose}><i className="fas fa-times"></i></article>
        <article className="logo">
          <StyledNavLink to={'/swap'}>
            <img src={Logo} alt="logo" />
          </StyledNavLink>
        </article>
        <HeaderLinks className={`menu_list`}>
          <li className="li" onClick={fn_btnHeaderClose}>
            <StyledNavLink to={'/swap'}>
              <i className="fas fa-exchange-alt"></i>
              <span className="text">{t('swap')}</span>
            </StyledNavLink>
          </li>
          <li className="li" onClick={fn_btnHeaderClose}>
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

          <li className="li" onClick={fn_btnHeaderClose}>
            <StyledNavLink to={'/farms'}>
              <i className="fas fa-egg"></i>
              <span className="text">{t('farm')}</span>
            </StyledNavLink>
          </li>

          <li className="li" onClick={fn_btnHeaderClose}>
            <StyledNavLink to={'/intro'}>
              <span className="text">{t('intro')}</span>
            </StyledNavLink>
          </li>
        </HeaderLinks>
        <HeaderControls className={`bottom_contents`}>
          <div className="connect">
            <Web3Status />
          </div>
          <AccountElement className={`signout`} active={!!account}>
            {account && (
              <section className="wallet">
                <HeaderElement className={`wallet_network`}>
                  <HideSmall>
                    {chainId && NETWORK_LABELS[chainId] && (
                      <NetworkCard title={NETWORK_LABELS[chainId]}>{NETWORK_LABELS[chainId]}</NetworkCard>
                    )}
                  </HideSmall>
                  {availableClaim && !showClaimPopup && (
                    <CLSYWrapper onClick={toggleClaimModal}>
                      <CLSYAmount active={!!account && !availableClaim} style={{ pointerEvents: 'auto' }}>
                        <TYPE.white padding="0 2px">
                          {claimTxn && !claimTxn?.receipt ? <Dots>Claiming CLSY</Dots> : 'Claim CLSY'}
                        </TYPE.white>
                      </CLSYAmount>
                      <CardNoise />
                    </CLSYWrapper>
                  )}
                </HeaderElement>
                  <article className="wallet_info">
                    <ul className="wallet_list">
                        {account && userEthBalance ? (
                          <li className="li">
                              <BalanceText className={`w_num`}>
                                {userEthBalance?.toSignificant(4)}
                              </BalanceText>
                              <span className="w_unit">MATIC</span>
                          </li>
                        ) : null}
                        {!availableClaim && aggregateBalance && (
                          <li className="li">
                            <CLSYWrapper onClick={() => setShowUniBalanceModal(true)}>
                              <CLSYAmount active={!!account && !availableClaim}>
                                <strong className="w_num">
                                    <CountUp
                                      key={countUpValue}
                                      isCounting
                                      start={parseFloat(countUpValuePrevious)}
                                      end={parseFloat(countUpValue)}
                                      thousandsSeparator={','}
                                      duration={1}
                                    />
                                </strong>
                                <span className="w_unit">CLSY</span>
                              </CLSYAmount>
                              <CardNoise />
                            </CLSYWrapper>
                          </li>
                        )}
                    </ul>
                  </article>
              </section>
            )}
          </AccountElement>
            <div id="footer"> 
              {/* <section className="footer_sns">
              <StyledNavLink className={`link`} to={'javascript:;'}>
                <i className="fab fa-instagram"></i>
              </StyledNavLink>
              <StyledNavLink className={`link`} to={'javascript:;'}>
                <i className="fab fa-twitter"></i>
              </StyledNavLink>
              <StyledNavLink className={`link`} to={'javascript:;'}>
                <i className="fab fa-facebook"></i>
              </StyledNavLink>
              </section> */}
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
    </HeaderFrame>
  )
}
