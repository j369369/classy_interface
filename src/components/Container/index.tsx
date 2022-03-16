import React, { useState } from 'react'
import './Container.css'

const Background = () => {
  return (
    <>
      <div className="cloud" />
      <div className="bg_shadow" />
    </>
  )
}

export default function Container({ children }: any) {
  return (
    <section id="container">
      <Background/>
      <article className="contents">
        <div className="contents_in">
          { children }
        </div>
      </article>
    </section>
  )
}
