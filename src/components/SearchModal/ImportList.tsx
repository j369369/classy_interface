import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import ReactGA from 'react-ga'
import { TYPE } from 'theme'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import { RowBetween, RowFixed, AutoRow } from 'components/Row'
import { ArrowLeft, AlertTriangle } from 'react-feather'
import useTheme from 'hooks/useTheme'
import { transparentize } from 'polished'
import { ButtonPrimary } from 'components/Button'
import { SectionBreak } from 'components/swap/styleds'
import { ExternalLink } from '../../theme/components'
import ListLogo from 'components/ListLogo'
import { PaddedColumn, Checkbox, TextDot } from './styleds'
import { TokenList } from '@uniswap/token-lists'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useFetchListCallback } from 'hooks/useFetchListCallback'
import { removeList, enableList } from 'state/lists/actions'
import { CurrencyModalView } from './CurrencySearchModal'
import { useAllLists } from 'state/lists/hooks'
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

interface ImportProps {
  listURL: string
  list: TokenList
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
}

export function ImportList({ listURL, list, setModalView, onDismiss }: ImportProps) {
  const theme = useTheme()
  const dispatch = useDispatch<AppDispatch>()

  // user must accept
  const [confirmed, setConfirmed] = useState(false)

  const lists = useAllLists()
  const fetchList = useFetchListCallback()

  // monitor is list is loading
  const adding = Boolean(lists[listURL]?.loadingRequestId)
  const [addError, setAddError] = useState<string | null>(null)

  const handleAddList = useCallback(() => {
    if (adding) return
    setAddError(null)
    fetchList(listURL)
      .then(() => {
        ReactGA.event({
          category: 'Lists',
          action: 'Add List',
          label: listURL
        })

        // turn list on
        dispatch(enableList(listURL))
        // go back to lists
        setModalView(CurrencyModalView.manage)
      })
      .catch(error => {
        ReactGA.event({
          category: 'Lists',
          action: 'Add List Failed',
          label: listURL
        })
        setAddError(error.message)
        dispatch(removeList(listURL))
      })
  }, [adding, dispatch, fetchList, listURL, setModalView])

  return (
    <div className='dis_flex_col'>
      <div className="modal_container">
        <section className="modal_head">
          <HoverText
            onClick={() => setModalView(CurrencyModalView.manage)}
            className='text sm'
          >
            <span className="ic_back">
              <i className="fas fa-angle-left"></i> 
            </span>
            <span>Back</span>
          </HoverText>
          <h4>Import List</h4>
          <CloseIcon close={onDismiss} />
        </section>
        <section className="modal_body">
          <div className="m_card">
            <section className='dis_flex_col gap10'>
              <div className="dis_flex between">
                <section className="dis_flex gap4">
                  <article className="dis_flex gap8">
                    {list.logoURI && <ListLogo logoURI={list.logoURI} size="40px" />}
                    <h4 className="">{list.name}</h4>
                    <span className="text gray">{list.tokens.length} tokens</span>
                  </article>
                </section>
              </div>
              <ExternalLink className="text sm aqua" href={`https://tokenlists.org/token-list?url=${listURL}`}>
                  <div className='dis_flex start gap4'>
                    <span><i className="fas fa-external-link-alt"></i></span>
                    <span>{listURL}</span>
                  </div>
              </ExternalLink>
            </section>
          </div>
          <article className="dis_flex_col gap10 text_center">
            <section className="f_cookie">
              <h1 className="text red"><i className="fas fa-exclamation-circle"></i></h1>
              <h4 className="text red">Import at your own risk!</h4>
            </section>
            <section className="dis_flex_col gap10">
              <p className="text sm">
                By adding this list you are implicitly trusting that the data is correct. Anyone can create a list,
                including creating fake versions of existing lists and lists that claim to represent projects that do
                not have one.
              </p>
              <h5 className="text red">If you purchase a token from this list, you may not be able to sell it back.</h5>
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
              type="button"
              onClick={handleAddList}
              className="button md yellow"
            >
              Import
            </button>
          )}
          {addError ? (
            <TYPE.error title={addError} style={{ textOverflow: 'ellipsis', overflow: 'hidden' }} error>
              {addError}
            </TYPE.error>
          ) : null}
        </section>
      </div>
    </div>
  )
}
