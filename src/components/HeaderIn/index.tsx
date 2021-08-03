import React from 'react'
import { NavLink } from 'react-router-dom'

import styled from 'styled-components'

import Logo from '../../assets/images/com/logo.svg'

import gsap from 'gsap'

const StyledNavLink = styled(NavLink)``

const fn_btnHeaderOpen = () => {
  const gsapHeader = gsap.timeline();
    gsapHeader
    .to("#header", { className: "+=active", ease: "expo" })
    .to("#headerBg", { display:"block", ease: "expo" }, '<');
}

export default function Header() {
  return (
    <header id="headerM">
			<section className="headerM_in">
				<article id="btnHeader" className="headerM_menu_btn" onClick={fn_btnHeaderOpen}>
					<i className="fas fa-bars"></i>
				</article>
				<article className="logo">
          <StyledNavLink to={'/swap'}>
            <img src={Logo} alt="logo" />
          </StyledNavLink>
        </article>
				<article className="headerM_wallet">
					<button type="button" className="headerM_wallet_btn">
						<i className="fas fa-wallet"></i>
					</button>
				</article>
			</section>
		</header>
  )
}
