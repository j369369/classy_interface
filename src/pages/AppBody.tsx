import React from 'react'
import AppBodyWrapper from 'components/AppBody'

export default function AppBody({ children, id }: { children: React.ReactNode, id?: string }) {
  return (
    <section id="appBody">
      <div className="app_contents">
        <AppBodyWrapper id={id}>{children}</AppBodyWrapper>
      </div>
    </section>
  )
}