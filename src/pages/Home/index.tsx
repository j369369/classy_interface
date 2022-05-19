import React, { useEffect }  from 'react'
import HomeWrapper from '../../components/Home'
import Logo from '../../assets/images/com/logo.svg'
import Web3Status from 'components/Web3Status'

const Background = () => {
  return (
    <>
      <div className="cloud" />
      <div className="bg_shadow" />
    </>
  )
}

export default function Home() {
  return (
    <div id="wrap">
      {/* <header id='header'>
        <a href="/" className="header_logo">
          <img src={Logo} alt="logo" />
        </a>
      </header> */}
      <section id="container" className="home">
        <Background/>
        <article className="contents">
          <div className="contents_in">
            <HomeWrapper/>
          </div>
        </article>
      </section>
      {/* <footer id='footer'></footer> */}
    </div>
  )
}
