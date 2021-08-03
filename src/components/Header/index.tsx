//import { ChainId, TokenAmount } from '@uniswap/sdk'
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
import { useActiveWeb3React } from '../../hooks'
import { useDarkModeManager } from '../../state/user/hooks'
import { useETHBalances, useAggregateUniBalance } from '../../state/wallet/hooks'
import { CardNoise } from '../earn/styled'
import { CountUp } from 'use-count-up'
import { TYPE } from '../../theme'

import { YellowCard } from '../Card'
import { Moon, Sun } from 'react-feather'
import Menu from '../Menu'
*/
//import Row from '../Row'
import Web3Status from '../Web3Status'
import ClaimModal from '../claim/ClaimModal'
// import { useToggleSelfClaimModal, useShowClaimPopup } from '../../state/application/hooks'
// import { useUserHasAvailableClaim } from '../../state/claim/hooks'
// import { useUserHasSubmittedClaim } from '../../state/transactions/hooks'
//import { Dots } from '../swap/styleds'
import Modal from '../Modal'
import UniBalanceContent from './UniBalanceContent'
// import usePrevious from '../../hooks/usePrevious'

const HeaderFrame = styled.header``
const HeaderControls = styled.div``
//const HeaderElement = styled.div``
const HeaderLinks = styled.ul``
const StyledNavLink = styled(NavLink)``


export default function Header() {
  const { t } = useTranslation()
  const [showUniBalanceModal, setShowUniBalanceModal] = useState(false)
 
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
          {/* Sign Out
          <div className="signout">
            <section className="wallet">
              <HeaderElement className={`wallet_code`} onClick={() => setShowUniBalanceModal(true)}>
                <span className="ic_code"><i className="fas fa-shield-alt"></i></span>
                <span id="walletStr">0xF94a ..... bbddaa</span>
              </HeaderElement>
              
                <article className="wallet_info">
                  <ul className="wallet_list">
                    <li className="li">
                      <strong className="w_num">3.5</strong>
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
          </div>
          */}
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
      <HeaderRow>
        <Title href=".">
          <UniIcon>
            <img width={'24px'} src={darkMode ? LogoDark : Logo} alt="logo" />
          </UniIcon>
        </Title>
        <HeaderLinks>
          <StyledNavLink id={`swap-nav-link`} to={'/swap'}>
            {t('swap')}
          </StyledNavLink>
          <StyledNavLink
            id={`pool-nav-link`}
            to={'/pool'}
            isActive={(match, { pathname }) =>
              Boolean(match) ||
              pathname.startsWith('/add') ||
              pathname.startsWith('/remove') ||
              pathname.startsWith('/create') ||
              pathname.startsWith('/find')
            }
          >
            {t('pool')}
          </StyledNavLink>
          <StyledNavLink id={`stake-nav-link`} to={'/uni'}>
            UNI
          </StyledNavLink>
          <StyledNavLink id={`stake-nav-link`} to={'/vote'}>
            Vote
          </StyledNavLink>
          <StyledExternalLink id={`stake-nav-link`} href={'https://uniswap.info'}>
            Charts <span style={{ fontSize: '11px' }}>↗</span>
          </StyledExternalLink>
        </HeaderLinks>
      </HeaderRow>
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
          <AccountElement active={!!account} style={{ pointerEvents: 'auto' }}>
            {account && userEthBalance ? (
              <BalanceText style={{ flexShrink: 0 }} pl="0.75rem" pr="0.5rem" fontWeight={500}>
                {userEthBalance?.toSignificant(4)} ETH
              </BalanceText>
            ) : null}
            <Web3Status />
          </AccountElement>
        </HeaderElement>
        <HeaderElementWrap>
          <StyledMenuButton onClick={() => toggleDarkMode()}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
          </StyledMenuButton>
          <Menu />
        </HeaderElementWrap>
      </HeaderControls>
    </HeaderFrame>
  )
}
