import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import AddressClaimModal from '../components/claim/AddressClaimModal'
import Header from '../components/Header'
import HeaderIn from '../components/HeaderIn'
import Polling from '../components/Header/Polling'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import { ApplicationModal } from '../state/application/actions'
import { useModalOpen, useToggleModal } from '../state/application/hooks'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import AddLiquidity from './AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity
} from './AddLiquidity/redirects'
import Earn from './Earn'
import Manage from './Earn/Manage'
import MigrateV1 from './MigrateV1'
import MigrateV1Exchange from './MigrateV1/MigrateV1Exchange'
import RemoveV1Exchange from './MigrateV1/RemoveV1Exchange'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Swap from './Swap'
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import Vote from './Vote'
import VotePage from './Vote/VotePage'
import Intro from './Intro'

import bgContentsTopLeft from '../assets/images/fo/bg_contents_top_left.png'
import bgContentsBottomRight from '../assets/images/fo/bg_contents_bottom_right.png'
import bgBlueCircle01 from '../assets/images/fo/bg_blue_circle_01.png'
import bgPinkCircle01 from '../assets/images/fo/bg_pink_circle_01.png'
import bgPinkCircle02 from '../assets/images/fo/bg_pink_circle_02.png'
import bgWhiteCircle01 from '../assets/images/fo/bg_white_circle_01.png'
import bgWhiteRing01 from '../assets/images/fo/bg_white_ring_01.png'

import gsap from 'gsap'

import '../assets/vendors/fontawesome-free-5.15.3-web 2/css/all.min.css'
import '../assets/css/common.css'
import '../assets/css/css.css'



import Farm from './Farm'





const AppWrapper = styled.div``
/*
const HeaderWrapper = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  justify-content: space-between;
`
*/

const BodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 100px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 16px;
    padding-top: 2rem;
  `};

  z-index: 1;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

/* ------- */
const BgImgsBox = () => {
	return(
		<section id="bgImgsBox">
			<img className="bg_contents_top_left" src={bgContentsTopLeft} alt="bg_contents_top_left" />
      <img className="bg_contents_bottom_right" src={bgContentsBottomRight} alt="bg_contents_bottom_right" />
      <img className="bg_blue_circle_01" src={bgBlueCircle01} alt="bg_blue_circle_01" />
      <img className="bg_pink_circle_01" src={bgPinkCircle01} alt="bg_pink_circle_01" />
      <img className="bg_pink_circle_02" src={bgPinkCircle02} alt="bg_pink_circle_02" />
      <img className="bg_white_circle_01" src={bgWhiteCircle01} alt="bg_white_circle_01" />
      <img className="bg_white_ring_01" src={bgWhiteRing01} alt="bg_white_ring_01" />
		</section>
	)
}

const fn_btnHeaderClose = () => {
  const gsapHeader = gsap.timeline();
    gsapHeader
    .to("#header", { className: "", ease: "power4" })
    .to("#headerBg", { display:"none" , ease: "power4"}, '-=1');
}

const fn_mouseParallax = (e: any) => {
  let mouseX = e.pageX / 2
  let mouseY = e.pageY / 2

  const mouseParallax = gsap.timeline();
  mouseParallax
    .to(".bg_blue_circle_01", { marginTop: (mouseY / 40), marginLeft: (mouseX / -40), duration: 0.5, ease: "expo"})
    .to(".bg_pink_circle_01", { marginTop: (mouseY / -60), marginRight: (mouseX / -60), duration: 0.5, ease: "expo"}, '-=1')
    .to(".bg_pink_circle_02", { marginTop: (mouseY / 90), marginRight: (mouseX / 90), duration: 0.5, ease: "expo"}, '-=1')
    .to(".bg_white_circle_01", { marginBottom: (mouseY / 90), marginLeft: (mouseX / 90), duration: 0.5, ease: "expo"}, '-=1')
    .to(".bg_white_ring_01", { marginBottom: (mouseY / -30), marginLeft: (mouseX / -30), duration: 0.5, ease: "expo"}, '-=1')
}

/* ------- */

function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.ADDRESS_CLAIM)
  const toggle = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  return <AddressClaimModal isOpen={open} onDismiss={toggle} />
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <BgImgsBox />
      <div id="wrap" onMouseMove={fn_mouseParallax}>
        <HeaderIn />
        <header id="headerBg" className="close_btn" onClick={fn_btnHeaderClose}></header>
        <Header />

        <AppWrapper id={`container`}>
        <URLWarning />
        <BodyWrapper>
          <Popups />
          <Polling />
          <TopLevelModals />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/swap" component={Swap} />
              <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={RedirectPathToSwapOnly} />
              <Route exact strict path="/find" component={PoolFinder} />
              <Route exact strict path="/pool" component={Pool} />
              <Route exact strict path="/farms" component={Farm} />
              <Route exact strict path="/intro" component={Intro} />
              <Route exact strict path="/uni" component={Earn} />
              <Route exact strict path="/vote" component={Vote} />
              <Route exact strict path="/create" component={RedirectToAddLiquidity} />
              <Route exact path="/add" component={AddLiquidity} />
              <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact path="/create" component={AddLiquidity} />
              <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact strict path="/remove/v1/:address" component={RemoveV1Exchange} />
              <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
              <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route exact strict path="/migrate/v1" component={MigrateV1} />
              <Route exact strict path="/migrate/v1/:address" component={MigrateV1Exchange} />
              <Route exact strict path="/uni/:currencyIdA/:currencyIdB" component={Manage} />
              <Route exact strict path="/vote/:id" component={VotePage} />
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </Web3ReactManager>
          <Marginer />
        </BodyWrapper>
      </AppWrapper>
      </div>
    </Suspense>
  )
}
