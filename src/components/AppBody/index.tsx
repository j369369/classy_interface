import React from 'react'
import './AppBody.css'

export default function AppBody({ children }: { children: React.ReactNode }) {
return (
  <>
    <div id="appBody">
      <section className="app_contents">
        {children}
      </section>
    </div>
  </>
)
}