import React, { CSSProperties } from 'react'
import { Token } from '@uniswap/sdk'
import { AutoRow, RowFixed } from 'components/Row'
import Column, { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { TYPE } from 'theme'
import ListLogo from 'components/ListLogo'
import { useActiveWeb3React } from 'hooks'
import { useCombinedInactiveList } from 'state/lists/hooks'
import useTheme from 'hooks/useTheme'
import { ButtonPrimary } from 'components/Button'
import styled from 'styled-components'
import { useIsUserAddedToken, useIsTokenActive } from 'hooks/Tokens'
import { CheckCircle } from 'react-feather'
import Row, { RowBetween } from '../Row'

const TokenSection = styled.div<{ dim?: boolean }>`
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto;
  grid-gap: 16px;
  align-items: center;

  opacity: ${({ dim }) => (dim ? '0.4' : '1')};
`

const CheckIcon = styled(CheckCircle)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: ${({ theme }) => theme.green1};
`

const NameOverflow = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  font-size: 12px;
`

export default function ImportRow({
  token,
  style,
  dim,
  showImportView,
  setImportToken
}: {
  token: Token
  style?: CSSProperties
  dim?: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  // gloabls
  const { chainId } = useActiveWeb3React()
  const theme = useTheme()

  // check if token comes from list
  const inactiveTokenList = useCombinedInactiveList()
  const list = chainId && inactiveTokenList?.[chainId]?.[token.address]?.list

  // check if already active on list or local storage tokens
  const isAdded = useIsUserAddedToken(token)
  const isActive = useIsTokenActive(token)

  return (
    <>
    <RowBetween>
      <RowFixed>
      <div className="token_logo" style={{ width: "32px", height: "32px" }}><CurrencyLogo currency={token} /></div>
        <AutoColumn gap="4px" style={{ marginLeft: '20px' }}>
          <TYPE.body fontWeight={600}>{token.symbol}</TYPE.body>
          <TYPE.main fontSize={'12px'}>
            {token.name} {list && list.logoURI && ` / via ${list.name}`}
          </TYPE.main>
        </AutoColumn>
      </RowFixed>
      {!isActive && !isAdded && (
        <button 
        type="button" 
        className="button round sm yellow"
        onClick={() => {
            setImportToken && setImportToken(token)
            showImportView()
          }}
        >
          Import
        </button>
      )}
    </RowBetween>
   
   </>
  )
}
