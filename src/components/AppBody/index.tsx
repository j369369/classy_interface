import React from 'react'
import './AppBody.css'

export default function AppBody({ children,id }: { children: React.ReactNode, id?: string }) {
return (
  <>
    <section id={id}>
      {children}
    </section>
  </>
)
}