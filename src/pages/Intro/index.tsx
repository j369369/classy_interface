import React, { useEffect }  from 'react'
import { NavLink } from 'react-router-dom'
import VanillaTilt from 'vanilla-tilt'
import '../../assets/style/intro.css'
import styled from 'styled-components'

const TiltIntro = styled.section``
const StyledNavLink = styled(NavLink)``


const Tilt = () => {
  let intro = document.querySelector('#container #intro') as HTMLParagraphElement
  VanillaTilt.init(intro);
}

export default function Intro() {
  useEffect(() => {
    Tilt();
  }, []);

  return (
    <TiltIntro id="intro" data-tilt data-tilt-scale="1">
      <article className="intro_in">
        <h1 id="introTitle" className="intro_title">
          Decentralized <br/>
          Crypto Assets Land
        </h1>
          <ul id="introLink" className="intro_link">
          <li className="li">
            <StyledNavLink to={'/swap'}>
              <i className="fas fa-exchange-alt"></i> Classy App
            </StyledNavLink>
           </li>
          <li className="li">
            <i className="fas fa-images"></i> Classy NFTs
          </li>
          <li className="li">
            <i className="fas fa-burn"></i> Classy Stadium
          </li>
        </ul>
      </article>
    </TiltIntro>
  )
}
