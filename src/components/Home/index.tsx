import React, { useEffect }  from 'react'
import { NavLink } from 'react-router-dom'
import { isBrowser } from 'react-device-detect';
import VanillaTilt from 'vanilla-tilt'
import './home.css'

const Tilt = () => {
  let intro = document.querySelector('#container .contents') as HTMLParagraphElement
  VanillaTilt.init(intro);
}

export default function Home() {
  useEffect(() => {
    if(isBrowser) {
      Tilt();
    }
  }, []);
  
  return (
    <section id="intro" data-tilt data-tilt-scale="1">
      <article className="intro_in">
        <h1 id="introTitle" className="intro_title f_cookie">
          Decentralized <br/>
          Crypto Assets Land
        </h1>
          <div id="introLink" className="intro_link">
          <a href="/">
            <button className="button lg indigo">
              <i className="fas fa-exchange-alt"></i> Classy App
            </button>
          </a>
          <a href="/">
            <button className="button lg blue">
              <i className="fas fa-images"></i> Classy NFTs
            </button>
          </a>
          <a href="/">
            <button className="button lg mint">
              <i className="fas fa-burn"></i> Classy Stadium
            </button>
          </a>
        </div>
      </article>
    </section>
  )
}
