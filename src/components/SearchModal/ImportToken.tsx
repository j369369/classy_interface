import React, { useState } from 'react'
import { Token, Currency } from '@uniswap/sdk'
import styled from 'styled-components'
import { TYPE } from 'theme'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import CurrencyLogo from 'components/CurrencyLogo'
import { ArrowLeft, AlertTriangle } from 'react-feather'
import { transparentize } from 'polished'
import useTheme from 'hooks/useTheme'
import { ButtonPrimary } from 'components/Button'
import { SectionBreak } from 'components/swap/styleds'
import { useAddUserToken } from 'state/user/hooks'
import { getEtherscanLink } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { ExternalLink, LinkIcon } from '../../theme/components'
import { useCombinedInactiveList } from 'state/lists/hooks'
import ListLogo from 'components/ListLogo'
import { PaddedColumn, Checkbox } from './styleds'
import CloseIcon from '../Modal/CloseIcon'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  overflow: auto;
`

const HoverText = styled.div`
  font-size: 14px;
  :hover {
    cursor: pointer;
  }
`
const LeftArrowIcon = styled.span`
  margin-right: 0.25rem;
`

const WarningWrapper = styled(Card)<{ highWarning: boolean }>`
  background-color: ${({ theme, highWarning }) =>
    highWarning ? transparentize(0.8, theme.red1) : transparentize(0.8, theme.yellow2)};
  width: fit-content;
`

const AddressText = styled(TYPE.blue)`
  font-size: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
`}
`

interface ImportProps {
  tokens: Token[]
  onBack?: () => void
  onDismiss?: () => void
  handleCurrencySelect?: (currency: Currency) => void
}

export function ImportToken({ tokens, onBack, onDismiss, handleCurrencySelect }: ImportProps) {
  const theme = useTheme()

  const { chainId } = useActiveWeb3React()

  const [confirmed, setConfirmed] = useState(false)

  const addToken = useAddUserToken()

  // use for showing import source on inactive tokens
  const inactiveTokenList = useCombinedInactiveList()

  // higher warning severity if either is not on a list
  const fromLists =
    (chainId && inactiveTokenList?.[chainId]?.[tokens[0]?.address]?.list) ||
    (chainId && inactiveTokenList?.[chainId]?.[tokens[1]?.address]?.list)

  return (
    <div className='dis_flex_col'>
      <div className="modal_container">
        <section className="modal_head">
          {onBack && (
            <HoverText
              onClick={onBack}
              className='text sm'
            >
              <span className="ic_back">
                <i className="fas fa-angle-left"></i> 
              </span>
              <span>Back</span>
            </HoverText>
          )}
          <h4>Import {tokens.length > 1 ? 'Tokens' : 'Token'}</h4>
          <CloseIcon close={onDismiss} />
        </section>
        <section className="modal_body">
          {tokens.map(token => {
            const list = chainId && inactiveTokenList?.[chainId]?.[token.address]?.list
            return (
              <>
                <div className="m_card">
                  <section className='dis_flex_col gap8'>
                    <AutoRow>
                      <CurrencyLogo currency={token} size={'24px'} />
                      <AutoRow gap="4px">
                        <h4 className="">{token.symbol}</h4>
                        <span className="text gray">{token.name}</span>
                        {list !== undefined && (
                          <RowFixed>
                            {/* {list.logoURI && <ListLogo logoURI={list.logoURI} size="12px" />} */}
                            <TYPE.small ml="6px" color={theme.text3}>
                              via {list.name}
                            </TYPE.small>
                          </RowFixed>
                        )}
                      </AutoRow>
                    </AutoRow>
                    {chainId && (
                      <ExternalLink className="text sm aqua" href={getEtherscanLink(chainId, token.address, 'address')}>
                          <div className='dis_flex start gap4'>
                            <span><i className="fas fa-external-link-alt"></i></span>
                            <span>{token.address}</span>
                          </div>
                      </ExternalLink>
                    )}
                    {list === undefined && (
                      <div>
                        <span className='label red'><i className="fas fa-exclamation-triangle"></i> Unknown Source</span>
                      </div>
                    )}
                  </section>
                </div>
              </>
            )
          })}
          <article className="dis_flex_col gap10 text_center">
            <section className="f_cookie">
              <h1 className={`text ${fromLists ? 'yellow' : 'red'}`}><i className="fas fa-exclamation-circle"></i></h1>
              <h4 className={`text ${fromLists ? 'yellow' : 'red'}`}>Trade at your own risk!</h4>
            </section>
            <section className="dis_flex_col gap10">
              <p className="text sm">
                Anyone can create a token, including creating fake versions of existing tokens that claim to represent projects.
              </p>
              <h5 className={`text ${fromLists ? 'yellow' : 'red'}`}>If you purchase this token, you may not be able to sell it back.</h5>
            </section>
            <section className="dis_flex center gap10" onClick={() => setConfirmed(!confirmed)}>
              <Checkbox
                className=".understand-checkbox"
                name="confirmed"
                type="checkbox"
                checked={confirmed}
                onChange={() => setConfirmed(!confirmed)}
              />
              <h6>I understand</h6>
            </section>
          </article>
          {confirmed && (
            <button
              onClick={() => {
                tokens.map(token => addToken(token))
                handleCurrencySelect && handleCurrencySelect(tokens[0])
              }}
              className="button md yellow"
            >
              Import
            </button>
          )}
        </section>
    </div>
  </div>
  )
}
