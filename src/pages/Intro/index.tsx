import React, { useEffect }  from 'react'
import VanillaTilt from 'vanilla-tilt'
import '../../assets/css/intro.css'
import styled from 'styled-components'

const TiltIntro = styled.section``


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
          <li className="li"><a href="/fo/swap.html">
            <i className="fas fa-exchange-alt"></i> Classy App
          </a></li>
          <li className="li"><a href="javascript:;">
            <i className="fas fa-images"></i> Classy NFTs
          </a></li>
          <li className="li"><a href="javascript:;">
            <i className="fas fa-burn"></i> Classy Stadium
          </a></li>
        </ul>
      </article>
    </TiltIntro>
  )
}
