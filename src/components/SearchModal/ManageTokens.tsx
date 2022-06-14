import React, { useRef, RefObject, useCallback, useState, useMemo } from 'react'
import Column from 'components/Column'
import { PaddedColumn, Separator, SearchInput } from './styleds'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { TYPE, ExternalLinkIcon, TrashIcon, ButtonText, ExternalLink } from 'theme'
import { useToken } from 'hooks/Tokens'
import styled from 'styled-components'
import { useUserAddedTokens, useRemoveUserAddedToken } from 'state/user/hooks'
import { Token } from '@uniswap/sdk'
import CurrencyLogo from 'components/CurrencyLogo'
import { getEtherscanLink, isAddress } from 'utils'
import { useActiveWeb3React } from 'hooks'
import Card from 'components/Card'
import ImportRow from './ImportRow'
import useTheme from '../../hooks/useTheme'

import { CurrencyModalView } from './CurrencySearchModal'

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  padding-bottom: 60px;
`

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 20px;
  text-align: center;
`
const ManageCard = styled.div`
  margin-top: 10px;
  padding: 1rem;
  width: 100%;
  background: var(--white);
  border-radius: 8px;
`

export default function ManageTokens({
  setModalView,
  setImportToken
}: {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
}) {
  const { chainId } = useActiveWeb3React()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const theme = useTheme()

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput = useCallback(event => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  // all tokens for local lisr
  const userAddedTokens: Token[] = useUserAddedTokens()
  const removeToken = useRemoveUserAddedToken()

  const handleRemoveAll = useCallback(() => {
    if (chainId && userAddedTokens) {
      userAddedTokens.map(token => {
        return removeToken(chainId, token.address)
      })
    }
  }, [removeToken, userAddedTokens, chainId])

  const tokenList = useMemo(() => {
    return (
      chainId &&
      userAddedTokens.map(token => (
        <RowBetween key={token.address} width="100%">
          <RowFixed>
            <CurrencyLogo currency={token} size={'20px'} />
            <ExternalLink href={getEtherscanLink(chainId, token.address, 'address')}>
              <TYPE.main ml={'10px'} fontWeight={600}>
                {token.symbol}
              </TYPE.main>
            </ExternalLink>
          </RowFixed>
          <RowFixed>
            <TrashIcon onClick={() => removeToken(chainId, token.address)} />
            <ExternalLinkIcon href={getEtherscanLink(chainId, token.address, 'address')} />
          </RowFixed>
        </RowBetween>
      ))
    )
  }, [userAddedTokens, chainId, removeToken])

  return (
    <Wrapper className="modal_container">
      <section className="modal_head dis_flex_col start">
        <div className="input_box">
          <input
            type="text"
            placeholder="0x0000"
            autoComplete="off"
            value={searchQuery}
            ref={inputRef as RefObject<HTMLInputElement>}
            onChange={handleInput}
          />
        </div>
        {searchQuery !== '' && !isAddressSearch && (
          <p className="text sm red" style={{marginTop: '4px'}}>Enter valid token address</p>
        )}
        {searchToken && (
          <ManageCard>
            <ImportRow
              token={searchToken}
              showImportView={() => setModalView(CurrencyModalView.importToken)}
              setImportToken={setImportToken}
              style={{ height: 'fit-content' }}
            />
          </ManageCard>
        )}
      </section>
      <section className="modal_body">
        <article>
          <div className="dis_flex between">
            <h6 className="dis_flex gap4">
              <span className="f_cookie text yellow">{userAddedTokens?.length}</span> <span className="text gray">Custom {userAddedTokens.length === 1 ? 'Token' : 'Tokens'}</span>
            </h6>
            {userAddedTokens.length > 0 && (
              <button type="button" className="button round sm yellow" onClick={handleRemoveAll}>
                Clear all
              </button>
            )}
          </div>
        </article>
        <article className="token_list">
          {tokenList}
          <RowBetween key={1} width="100%">
            <RowFixed>
              <div>로고로고</div>
              <ExternalLink href="/">
                <TYPE.main ml={'10px'} fontWeight={600}>
                  ㄴㅇㄹㄴㅇㄹㄴㅇㄹㄴㅇㄹㄴㄹㅇ
                </TYPE.main>
              </ExternalLink>
            </RowFixed>
            <RowFixed>
              <TrashIcon />
              <ExternalLinkIcon href="/" />
            </RowFixed>
          </RowBetween>
        </article>
      </section>
      <Footer className="modal_body">
        <h6 className="text yellow fw_400">Tip: Custom tokens are stored locally in your browser</h6>
      </Footer>
    </Wrapper>
  )
}
