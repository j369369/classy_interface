import React from 'react'
import AppBodyWrapper from 'components/AppBody'

export default function AppBody({ children }: { children: React.ReactNode }) {
  return <AppBodyWrapper>{children}</AppBodyWrapper>
}