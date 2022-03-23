import React, { useCallback, useState } from 'react'
import { CurrencyAmount } from '@uniswap/sdk'
import styled from 'styled-components'

import { useExpertModeManager } from '../../state/user/hooks'
import { useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../state/swap/hooks'
import { Field } from '../../state/swap/actions'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import useToggledVersion, {Version } from '../../hooks/useToggledVersion'
import { maxAmountSpend } from '../../utils/maxAmountSpend'

import { ArrowDown } from 'react-feather'
import { AutoRow } from '../../components/Row'
import AddressInputPanel from '../../components/AddressInputPanel'

import { ArrowWrapper } from '../../components/swap/styleds'
import SwapIcon from '../../components/swap/SwapIcon'
import CurrencyInputPanel from '../CurrencyInputPanel'

import { LinkStyledButton } from '../../theme'


const AddSendButton = styled.div`
  position: absolute;
  top: -8px;
  right: 0;
  font-size: 12px;

  * {
    color: var(--blue-05);
    font-size: 12px;
  }

  @media(max-width: 768px) {
    overflow: hidden;
    top: -11px;
    width: 90px;
    height: 15px;
  }
`


export default function SwapBody({
  setApprovalSubmitted
}: {
  setApprovalSubmitted: (value: boolean) => void
}) {

  const [isExpertMode] = useExpertModeManager()
  const { independentField, typedValue, recipient } = useSwapState()

  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
  } = useDerivedSwapInfo()

  const { wrapType } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )

  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE

  const toggledVersion = useToggledVersion()
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  }
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion]

  const parsedAmounts = showWrap
  ? {
      [Field.INPUT]: parsedAmount,
      [Field.OUTPUT]: parsedAmount
    }
  : {
      [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
      [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
    }

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput]
  )

  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput]
  )

  const handleInputSelect = useCallback(
    inputCurrency => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
    },
    [onCurrencySelection]
  )

  const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
    onCurrencySelection
  ])


  const handleMaxInput = useCallback(() => {
    maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  return (
    <article className="swap_body">
      <section>
        <CurrencyInputPanel
          label={independentField === Field.OUTPUT && !showWrap && trade ? 'From (estimated)' : 'From'}
          value={formattedAmounts[Field.INPUT]}
          showMaxButton={!atMaxAmountInput}
          currency={currencies[Field.INPUT]}
          onUserInput={handleTypeInput}
          onMax={handleMaxInput}
          onCurrencySelect={handleInputSelect}
          otherCurrency={currencies[Field.OUTPUT]}
          id="swapFrom"
        />
        <div>
          <article className="swap_icon_wrap">
              <div className="swap_button">
                <SwapIcon 
                  onClick={() => {
                    setApprovalSubmitted(false) // reset 2 step UI for approvals
                    onSwitchTokens()
                  }}
                />
              </div>
          </article>
        </div>
        <CurrencyInputPanel
          value={formattedAmounts[Field.OUTPUT]}
          onUserInput={handleTypeOutput}
          label={independentField === Field.INPUT && !showWrap && trade ? 'To (estimated)' : 'To'}
          showMaxButton={false}
          currency={currencies[Field.OUTPUT]}
          onCurrencySelect={handleOutputSelect}
          otherCurrency={currencies[Field.INPUT]}
          id="swapTo"
        />
        {(recipient === null && !showWrap && isExpertMode) && (
          <div className="send_box">
            <button type="button" className="button line round sm yellow" onClick={() => onChangeRecipient('')}><i className="fas fa-plus-circle"></i> Send</button>
            {(recipient !== null && !showWrap) && (
              <div className="contents">
                <div className="remove text red" onClick={() => onChangeRecipient(null)}>
                  <i className="fas fa-minus-circle"></i>
                </div>
                <AddressInputPanel value={recipient} onChange={onChangeRecipient} />
              </div>
            )}
          </div>
        )}
      </section>
    </article>
  )
}
