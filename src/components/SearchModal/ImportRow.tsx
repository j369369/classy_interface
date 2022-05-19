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

const TokenSection = styled.div<{ dim?: boolean }>`
  padding: 4px 20px;
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
    <TokenSection style={style}>
      <div className="token_logo" style={{ width: "32px", height: "32px" }}><CurrencyLogo currency={token} /></div>
      <Column>
        <h5>{token.symbol}</h5>
        <AutoRow gap="2px">
          <h6 className="text sm gray">{token.name}</h6>
          {list && list.logoURI && (
            <RowFixed>
              <h6 className="text xs brown">
                via {list.name}
              </h6>
              {/* <ListLogo logoURI={list.logoURI} size="12px" /> */}
            </RowFixed>
          )}
        </AutoRow>
      </Column>
      <RowFixed style={{ justifySelf: 'flex-end' }}>
        {!isActive && !isAdded ? (
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
        ) : (
          <RowFixed style={{ minWidth: 'fit-content' }}>
            <CheckIcon />
            <TYPE.main color={theme.green1}>Active</TYPE.main>
          </RowFixed>
        )}
      </RowFixed>
    </TokenSection>
   </>
  )
}
