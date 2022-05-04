import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { JSBI, Token, Trade } from '@uniswap/sdk'
import ReactGA from 'react-ga'

import { isTradeBetter } from 'utils/trades'
import { useActiveWeb3React } from '../../hooks'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import useENSAddress from '../../hooks/useENSAddress'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import useToggledVersion, { DEFAULT_VERSION, Version } from '../../hooks/useToggledVersion'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import { useToggleSettingsMenu, useWalletModalToggle } from '../../state/application/hooks'
import { useExpertModeManager, useUserSlippageTolerance, useUserSingleHopOnly } from '../../state/user/hooks'
import { useDefaultsFromURLSearch, useDerivedSwapInfo, useSwapActionHandlers, useSwapState } from '../../state/swap/hooks'

import { getTradeVersion } from '../../data/V1'
import { Field } from '../../state/swap/actions'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import { INITIAL_ALLOWED_SLIPPAGE } from '../../constants'

import Loader from '../../components/Loader'
import ProgressSteps from '../../components/ProgressSteps'

import { SwapCallbackError } from '../../components/swap/styleds'
// import BetterTradeLink, { DefaultVersionLink } from '../../components/swap/BetterTradeLink'
import confirmPriceImpactWithoutFee from '../../components/swap/confirmPriceImpactWithoutFee'
import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import AdvancedSwapDetailsDropdown from '../../components/swap/AdvancedSwapDetailsDropdown'
import TradePrice from '../../components/swap/TradePrice'


export default function SwapFoot({
  approvalSubmitted
}: {
  approvalSubmitted: boolean
}) {

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { account } = useActiveWeb3React()

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()
  
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
  // const defaultTrade = showWrap ? undefined : tradesByVersion[DEFAULT_VERSION]
  
  // const betterTradeLinkV2: Version | undefined =
  // toggledVersion === Version.v1 && isTradeBetter(v1Trade, v2Trade) ? Version.v2 : undefined

  const parsedAmounts = showWrap
  ? {
    [Field.INPUT]: parsedAmount,
    [Field.OUTPUT]: parsedAmount
    }
  : {
    [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
    [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount
  }

  const isValid = !swapInputError

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

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const route = trade?.route
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0))
  )
  
  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

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


  // for expert mode
  const toggleSettings = useToggleSettingsMenu()
  const [isExpertMode] = useExpertModeManager()

  const showApproveFlow =
  !swapInputError &&
  (approval === ApprovalState.NOT_APPROVED ||
    approval === ApprovalState.PENDING ||
    (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
  !(priceImpactSeverity > 3 && !isExpertMode)

  
  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  return (
    <article className="swap_foot">
      <ul className="swap_info">
        {showWrap ? null : (
          <li>
              {Boolean(trade) && (
                <>
                  <div className="info_title">
                    <span className="yellow_title">Rate</span>
                  </div>
                  <div className="info_contents">
                    <TradePrice price={trade?.executionPrice} showInverted={showInverted} setShowInverted={setShowInverted} />
                  </div>
                </>
              )}
          </li>
        )}
      </ul>
      <ul className="swap_info">
        {allowedSlippage !== INITIAL_ALLOWED_SLIPPAGE && (
          <li>
            <div className="info_title">
              Slippage Tolerance
            </div>
            <div className="info_contents">
              <span className="num">{allowedSlippage / 100}%</span>
            </div>
          </li>
        )} 
      </ul>
        {!swapIsUnsupported ? (
          <AdvancedSwapDetailsDropdown trade={trade} />
        ) : (
          <UnsupportedCurrencyFooter show={swapIsUnsupported} currencies={[currencies.INPUT, currencies.OUTPUT]} />
        )} 
      
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
              className={`button round lg ${(approval !== ApprovalState.NOT_APPROVED || approvalSubmitted) ? "disabled" : "green"}`}
              onClick={approveCallback}
              // disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
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
              className={`button round lg ${(isValid || approval == ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)) ? "disabled" : (isValid && priceImpactSeverity > 2) ? "error" : "tropical"}`}
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
              // disabled={
              //   isValid || approval == ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
              // }
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
            className={`button round lg ${(!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError) ? "disabled" : (isValid && priceImpactSeverity > 2 && !swapCallbackError) ? "error" : "tropical"}`}
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
            // disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
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
        <div>
          <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
        </div>
      )}
      {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}

      {/* {betterTradeLinkV2 && !swapIsUnsupported && toggledVersion === Version.v1 ? (
        <BetterTradeLink version={betterTradeLinkV2} />
      ) : toggledVersion !== DEFAULT_VERSION && defaultTrade ? (
        <DefaultVersionLink />
      ) : null} */}
    </article>
  )
}
