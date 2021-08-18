import React from 'react'
import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  max-width: 26.25rem;
  width: 100%;
  background: var(--bg-gradient-white-02);
  backdrop-filter: var(--bg-filter-blur);
  box-shadow: var(--bg-box-shadow);
  border-radius: 1rem;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
