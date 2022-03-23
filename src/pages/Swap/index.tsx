// import { CurrencyAmount, JSBI, Token, Trade } from '@uniswap/sdk'
import { JSBI, Token, Trade } from '@uniswap/sdk'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
// import { ArrowDown } from 'react-feather'
import ReactGA from 'react-ga'
// import { Text } from 'rebass'
// import styled, { ThemeContext } from 'styled-components'
// import AddressInputPanel from '../../components/AddressInputPanel'
// import { ButtonError, ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
// import Card, { GreyCard } from '../../components/Card'
// import { GreyCard } from '../../components/Card'
// import Column, { AutoColumn } from '../../components/Column'
import ConfirmSwapModal from '../../components/swap/ConfirmSwapModal'
// import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { SwapPoolTabs } from '../../components/NavigationTabs'
// import { AutoRow, RowBetween } from '../../components/Row'
// import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
// import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
// import { ArrowWrapper, BottomGrouping, SwapCallbackError, Wrapper } from '../../components/swap/styleds'
// import { SwapCallbackError } from '../../components/swap/styleds'
// import TradePrice from '../../components/swap/TradePrice'
import TokenWarningModal from '../../components/TokenWarningModal'
// import ProgressSteps from '../../components/ProgressSteps'
// import SwapIcon from '../../components/swap/SwapIcon'

// import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'
import { getTradeVersion } from '../../data/V1'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import useENSAddress from '../../hooks/useENSAddress'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance, useUserSingleHopOnly } from '../../state/user/hooks'
// import { LinkStyledButton, TYPE } from '../../theme'
// import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import AppBody from '../AppBody'
//import { ClickableText } from '../Pool/styleds'
// import Loader from '../../components/Loader'
import { useIsTransactionUnsupported } from 'hooks/Trades'
// import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { isTradeBetter } from 'utils/trades'
// import IcChange from '../../assets/images/fo/ic_change.svg'

import SwapHead from '../../components/swap/SwapHead'
import SwapBody from '../../components/swap/SwapBody'
import SwapFoot from '../../components/swap/SwapFoot'

// const ChangeIcon = styled.div`
//   position: relative;
//   margin-top: -1.5rem;
//   width: 3.125rem;
//   height: 3.125rem;
//   background: var(--white);
//   border-radius: 10rem;
//   box-shadow: var(--bg-box-shadow);
//   cursor: pointer;

//   img {
//     position: absolute;
//     top: 0;
//     right: 0;
//     bottom: 0;
//     left: 0;
//     margin: auto;
//   }

//   @media(max-width: 768px) {
//     width: 2.75rem;
//     height: 2.75rem;

//     img {
//       width: 14px;
//     }
//   }
// `

// const AddSendButton = styled.div`
//   position: absolute;
//   top: -8px;
//   right: 0;
//   font-size: 12px;

//   * {
//     color: var(--blue-05);
//     font-size: 12px;
//   }

//   @media(max-width: 768px) {
//     overflow: hidden;
//     top: -11px;
//     width: 90px;
//     height: 15px;
//   }
// `

export default function Swap() {
  const loadedUrlParams = useDefaultsFromURLSearch()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId)
  ]
  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )
  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !Boolean(token.address in defaultTokens)
    })

  const { account } = useActiveWeb3React()
  // const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const {
    v1Trade,
    v2Trade,
    currencyBalances,
    parsedAmount,
    currencies,
    inputError: swapInputError
  } = useDerivedSwapInfo()
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useWrapCallback(
    currencies[Field.INPUT],
    currencies[Field.OUTPUT],
    typedValue
  )
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const { address: recipientAddress } = useENSAddress(recipient)
  const toggledVersion = useToggledVersion()
  const tradesByVersion = {
    [Version.v1]: v1Trade,
    [Version.v2]: v2Trade
  }
  const trade = showWrap ? undefined : tradesByVersion[toggledVersion]
  const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]

  const betterTradeLinkV2: Version | undefined =
    toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade) ? Version.v2 : undefined

  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
      }

  // const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const { onUserInput } = useSwapActionHandlers()
  const isValid = !swapInputError
  // const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  // const handleTypeInput = useCallback(
  //   (value: string) => {
  //     onUserInput(Field.INPUT, value)
  //   },
  //   [onUserInput]
  // )
  // const handleTypeOutput = useCallback(
  //   (value: string) => {
  //     onUserInput(Field.OUTPUT, value)
  //   },
  //   [onUserInput]
  // )

  // modal and loading
  const [{ showConfirm, tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    showConfirm: boolean
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    showConfirm: false,
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined
  })

  // const formattedAmounts = {
  //   [independentField]: typedValue,
  //   [dependentField]: showWrap
  //     ? parsedAmounts[independentField]?.toExact() ?? ''
  //     : parsedAmounts[dependentField]?.toSignificant(6) ?? ''
  // }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  // const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  // const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then(hash => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, showConfirm, swapErrorMessage: undefined, txHash: hash })

        ReactGA.event({
          category: 'Swap',
          action:
            recipient === null
              ? 'Swap w/o Send'
              : (recipientAddress ?? recipient) === account
              ? 'Swap w/o Send + recipient'
              : 'Swap w/ Send',
          label: [
            trade?.inputAmount?.currency?.symbol,
            trade?.outputAmount?.currency?.symbol,
            getTradeVersion(trade)
          ].join('/')
        })

        ReactGA.event({
          category: 'Routing',
          action: singleHopOnly ? 'Swap with multihop disabled' : 'Swap with multihop enabled'
        })
      })
      .catch(error => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          showConfirm,
          swapErrorMessage: error.message,
          txHash: undefined
        })
      })
  }, [
    priceImpactWithoutFee,
    swapCallback,
    tradeToConfirm,
    showConfirm,
    recipient,
    recipientAddress,
    account,
    trade,
    singleHopOnly
  ])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ showConfirm: false, tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn, showConfirm })
  }, [attemptingTxn, showConfirm, swapErrorMessage, trade, txHash])

  // const handleInputSelect = useCallback(
  //   inputCurrency => {
  //     setApprovalSubmitted(false) // reset 2 step UI for approvals
  //     onCurrencySelection(Field.INPUT, inputCurrency)
  //   },
  //   [onCurrencySelection]
  // )

  // const handleMaxInput = useCallback(() => {
  //   maxAmountInput && onUserInput(Field.INPUT, maxAmountInput.toExact())
  // }, [maxAmountInput, onUserInput])

  // const handleOutputSelect = useCallback(outputCurrency => onCurrencySelection(Field.OUTPUT, outputCurrency), [
  //   onCurrencySelection
  // ])

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  return (
    <>
      <TokenWarningModal
        isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
        tokens={importTokensNotInDefault}
        onConfirm={handleConfirmTokenWarning}
      />
      <SwapPoolTabs active={'swap'} />
      <AppBody id="swap">
        <SwapHead />
        <SwapBody setApprovalSubmitted={setApprovalSubmitted} />
        <SwapFoot approvalSubmitted={approvalSubmitted} />

        <ConfirmSwapModal
          isOpen={showConfirm}
          trade={trade}
          originalTrade={tradeToConfirm}
          onAcceptChanges={handleAcceptChanges}
          attemptingTxn={attemptingTxn}
          txHash={txHash}
          recipient={recipient}
          allowedSlippage={allowedSlippage}
          onConfirm={handleSwap}
          swapErrorMessage={swapErrorMessage}
          onDismiss={handleConfirmDismiss}
        />
        {/* <article id="swap">
          <div>
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
            <AutoColumn justify="center">
              <AutoRow justify="center" id="swapIcon">
                <div
                    onClick={() => {
                      setApprovalSubmitted(false) // reset 2 step UI for approvals
                      onSwitchTokens()
                    }}
                  >
                  <SwapIcon />
                </div>
                {recipient === null && !showWrap && isExpertMode ? (
                  <AddSendButton>
                    <LinkStyledButton id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                      + Add a send (optional)
                    </LinkStyledButton>
                  </AddSendButton>
                ) : null}
              </AutoRow>
            </AutoColumn>
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

            {recipient !== null && !showWrap ? (
              <>
                <AutoRow justify="center" style={{position: "relative"}}>
                  <ArrowWrapper clickable={false}>
                    <ArrowDown size="16" color={theme.text2} />
                  </ArrowWrapper>
                  <LinkStyledButton id="remove-recipient-button" onClick={() => onChangeRecipient(null)} style={{position: "absolute", right: 0}}>
                    - Remove send
                  </LinkStyledButton>
                </AutoRow>
                <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
              </>
            ) : null}

            {showWrap ? null : (
              <Card padding={showWrap ? '.25rem 1rem 0 1rem' : '0px'} borderRadius={'20px'}>
                <AutoColumn gap="8px">
                  {Boolean(trade) && (
                    <RowBetween align="center" id={`swapRate`} >
                      <Text className={`text blue04`} fontWeight={500} fontSize={14} style={{width: '50px'}}>
                        Rate
                      </Text>
                        <TradePrice
                          price={trade?.executionPrice}
                          showInverted={showInverted}
                          setShowInverted={setShowInverted}
                        />
                    </RowBetween>
                  )}
                </AutoColumn>
              </Card>
            )}
          </div>
        </article> */}
        {/* <article className="swap_foot">
          <div className="swap_info">
            {showWrap ? null : (
              <section className="dis_flex between">
                  {Boolean(trade) && (
                    <>
                      <div>
                        Rate
                      </div>
                      <div>
                      <TradePrice price={trade?.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
                      </div>
                    </>
                  )}
              </section>
            )}
            <section>
              {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
                <>
                  <strong onClick={toggleSettings}>
                    Slippage Tolerance
                  </strong>
                  <span onClick={toggleSettings}>
                    {allowedSlippage / 100}%
                  </span>
                </>
              )}
              {!swapIsUnsupported ? (
                <AdvancedSwapDetailsDropdown trade={trade} />
              ) : (
                <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
              )}
            </section>
          </div>
          <div className="swap_button_box">
            {swapIsUnsupported ? (
              <button type="button" className="button round line lg error" disabled>Unsupported Asset</button>
            ) : !account ? (
              <button type="button" className="button round lg blue" onClick={toggleWalletModal}>Connect Wallet</button>
            ) : showWrap ? (
              <button type="button" className="button round line lg error" onClick={onWrap}>
                {wrapInputError ??
                  (wrapType === WrapType.WRAP ? 'Wrap' : wrapType === WrapType.UNWRAP ? 'Unwrap' : null)}
              </button>
            ) : noRoute && userHasSpecifiedInputOutput ? (
              <div className="swap_card">
                <p className="text">Insufficient liquidity for this trade.
                {singleHopOnly && " Try enabling multi-hop trades."}
                </p>
              </div>
            ) : showApproveFlow ? (
              <div className="any">
                <button
                  type="button"
                  className="button round lg green"
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                >
                  {approval === ApprovalState.PENDING ? (
                    <>
                      Approving <Loader stroke="white" />
                    </>
                  ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                    'Approved'
                  ) : (
                    'Approve ' + currencies[Field.INPUT]?.symbol
                  )}
                </button>
                <button
                  type="button"
                  className="button round lg error"
                  onClick={() => {
                    if (isExpertMode) {
                      handleSwap()
                    } else {
                      setSwapState({
                        tradeToConfirm: trade,
                        attemptingTxn: false,
                        swapErrorMessage: undefined,
                        showConfirm: true,
                        txHash: undefined
                      })
                    }
                  }}
                  disabled={
                    isValid || approval == ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                  }
                  // error={isValid && priceImpactSeverity > 2}
                >
                  {priceImpactSeverity > 3 && !isExpertMode
                    ? `Price Impact High`
                    : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="button round lg error"
                onClick={() => {
                  if (isExpertMode) {
                    handleSwap()
                  } else {
                    setSwapState({
                      tradeToConfirm: trade,
                      attemptingTxn: false,
                      swapErrorMessage: undefined,
                      showConfirm: true,
                      txHash: undefined
                    })
                  }
                }}
                disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                // error={isValid && priceImpactSeverity > 2 && !swapCallbackError}
              >
                {swapInputError
                  ? swapInputError
                  : priceImpactSeverity > 3 && !isExpertMode
                  ? `Price Impact Too High`
                  : `Swap${priceImpactSeverity > 2 ? ' Anyway' : ''}`}
              </button>
            )}
          </div>
          {showApproveFlow && (
            <Column style={{ marginTop: '1rem' }}>
              <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
            </Column>
          )}
          {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
          {betterTradeLinkV2 && !swapIsUnsupported && toggledVersion === Version.v1 ? (
            <BetterTradeLink version={betterTradeLinkV2} />
          ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
            <DefaultVersionLink />
          ) : null}
        </article> */}
      </AppBody>
    </>
  )
}
