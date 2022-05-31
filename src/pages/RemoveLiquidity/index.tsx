import { splitSignature } from '@ethersproject/bytes'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, currencyEquals, ETHER, Percent, WETH } from '@uniswap/sdk'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { ArrowDown, Plus } from 'react-feather'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router'
import { Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { ButtonPrimary, ButtonLight, ButtonError, ButtonConfirmed } from '../../components/Button'
import { /*BlueCard, */LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { MinimalPositionCard } from '../../components/PositionCard'
import Row, { RowBetween, RowFixed } from '../../components/Row'

import Slider from '../../components/Slider'
import CurrencyLogo from '../../components/CurrencyLogo'
import { ROUTER_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCurrency } from '../../hooks/Tokens'
import { usePairContract } from '../../hooks/useContract'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { StyledInternalLink, TYPE } from '../../theme'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { currencyId } from '../../utils/currencyId'
import useDebouncedChangeHandler from '../../utils/useDebouncedChangeHandler'
import { wrappedCurrency } from '../../utils/wrappedCurrency'
import AppBody from '../AppBody'
import { ClickableText, MaxButton, Wrapper } from '../Pool/styleds'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { Dots } from '../../components/swap/styleds'
import { useBurnActionHandlers } from '../../state/burn/hooks'
import { useDerivedBurnInfo, useBurnState } from '../../state/burn/hooks'
import { Field } from '../../state/burn/actions'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { BigNumber } from '@ethersproject/bignumber'

export default function RemoveLiquidity({
  history,
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const [currencyA, currencyB] = [useCurrency(currencyIdA) ?? undefined, useCurrency(currencyIdB) ?? undefined]
  const { account, chainId, library } = useActiveWeb3React()
  const [tokenA, tokenB] = useMemo(() => [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)], [
    currencyA,
    currencyB,
    chainId
  ])

  const theme = useContext(ThemeContext)

  // toggle wallet when disconnected
  const toggleWalletModal = useWalletModalToggle()

  // burn state
  const { independentField, typedValue } = useBurnState()
  const { pair, parsedAmounts, error } = useDerivedBurnInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onUserInput: _onUserInput } = useBurnActionHandlers()
  const isValid = !error

  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showDetailed, setShowDetailed] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState(false) // clicked confirm

  // txn values
  const [txHash, setTxHash] = useState<string>('')
  const deadline = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippageTolerance()

  const formattedAmounts = {
    [Field.LIQUIDITY_PERCENT]: parsedAmounts[Field.LIQUIDITY_PERCENT].equalTo('0')
      ? '0'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].lessThan(new Percent('1', '100'))
      ? '<1'
      : parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0),
    [Field.LIQUIDITY]:
      independentField === Field.LIQUIDITY ? typedValue : parsedAmounts[Field.LIQUIDITY]?.toSignificant(6) ?? '',
    [Field.CURRENCY_A]:
      independentField === Field.CURRENCY_A ? typedValue : parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    [Field.CURRENCY_B]:
      independentField === Field.CURRENCY_B ? typedValue : parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? ''
  }

  const atMaxAmount = parsedAmounts[Field.LIQUIDITY_PERCENT]?.equalTo(new Percent('1'))

  // pair contract
  const pairContract: Contract | null = usePairContract(pair?.liquidityToken?.address)

  // allowance handling
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmounts[Field.LIQUIDITY], ROUTER_ADDRESS)

  const isArgentWallet = useIsArgentWallet()

  async function onAttemptToApprove() {
    if (!pairContract || !pair || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    if (isArgentWallet) {
      return approveCallback()
    }

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account)

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
    const domain = {
      name: 'ClassySwap LP',
      version: '1',
      chainId: chainId,
      verifyingContract: pair.liquidityToken.address
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
    const message = {
      owner: account,
      spender: ROUTER_ADDRESS,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber()
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadline.toNumber()
        })
      })
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          approveCallback()
        }
      })
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      setSignatureData(null)
      return _onUserInput(field, typedValue)
    },
    [_onUserInput]
  )

  const onLiquidityInput = useCallback((typedValue: string): void => onUserInput(Field.LIQUIDITY, typedValue), [
    onUserInput
  ])
  const onCurrencyAInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_A, typedValue), [
    onUserInput
  ])
  const onCurrencyBInput = useCallback((typedValue: string): void => onUserInput(Field.CURRENCY_B, typedValue), [
    onUserInput
  ])

  // tx sending
  const addTransaction = useTransactionAdder()
  async function onRemove() {
    if (!chainId || !library || !account || !deadline) throw new Error('missing dependencies')
    const { [Field.CURRENCY_A]: currencyAmountA, [Field.CURRENCY_B]: currencyAmountB } = parsedAmounts
    if (!currencyAmountA || !currencyAmountB) {
      throw new Error('missing currency amounts')
    }
    const router = getRouterContract(chainId, library, account)

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(currencyAmountA, allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(currencyAmountB, allowedSlippage)[0]
    }

    if (!currencyA || !currencyB) throw new Error('missing tokens')
    const liquidityAmount = parsedAmounts[Field.LIQUIDITY]
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    const currencyBIsETH = currencyB === ETHER
    const oneCurrencyIsMATIC = currencyA === ETHER || currencyBIsETH

    if (!tokenA || !tokenB) throw new Error('could not wrap')

    let methodNames: string[], args: Array<string | string[] | number | boolean>
    // we have approval, use normal remove liquidity
    if (approval === ApprovalState.APPROVED) {
      // removeLiquidityETH
      if (oneCurrencyIsMATIC) {
        methodNames = ['removeLiquidityETH', 'removeLiquidityETHSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          deadline.toHexString()
        ]
      }
      // removeLiquidity
      else {
        methodNames = ['removeLiquidity']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          deadline.toHexString()
        ]
      }
    }
    // we have a signataure, use permit versions of remove liquidity
    else if (signatureData !== null) {
      // removeLiquidityETHWithPermit
      if (oneCurrencyIsMATIC) {
        methodNames = ['removeLiquidityETHWithPermit', 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens']
        args = [
          currencyBIsETH ? tokenA.address : tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(),
          amountsMin[currencyBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s
        ]
      }
      // removeLiquidityETHWithPermit
      else {
        methodNames = ['removeLiquidityWithPermit']
        args = [
          tokenA.address,
          tokenB.address,
          liquidityAmount.raw.toString(),
          amountsMin[Field.CURRENCY_A].toString(),
          amountsMin[Field.CURRENCY_B].toString(),
          account,
          signatureData.deadline,
          false,
          signatureData.v,
          signatureData.r,
          signatureData.s
        ]
      }
    } else {
      throw new Error('Attempting to confirm without approval or a signature. Please contact support.')
    }

    const safeGasEstimates: (BigNumber | undefined)[] = await Promise.all(
      methodNames.map(methodName =>
        router.estimateGas[methodName](...args)
          .then(calculateGasMargin)
          .catch(error => {
            console.error(`estimateGas failed`, methodName, args, error)
            return undefined
          })
      )
    )

    const indexOfSuccessfulEstimation = safeGasEstimates.findIndex(safeGasEstimate =>
      BigNumber.isBigNumber(safeGasEstimate)
    )

    // all estimations failed...
    if (indexOfSuccessfulEstimation === -1) {
      console.error('This transaction would fail. Please contact support.')
    } else {
      const methodName = methodNames[indexOfSuccessfulEstimation]
      const safeGasEstimate = safeGasEstimates[indexOfSuccessfulEstimation]

      setAttemptingTxn(true)
      await router[methodName](...args, {
        gasLimit: safeGasEstimate
      })
        .then((response: TransactionResponse) => {
          setAttemptingTxn(false)

          addTransaction(response, {
            summary:
              'Remove ' +
              parsedAmounts[Field.CURRENCY_A]?.toSignificant(3) +
              ' ' +
              currencyA?.symbol +
              ' and ' +
              parsedAmounts[Field.CURRENCY_B]?.toSignificant(3) +
              ' ' +
              currencyB?.symbol
          })

          setTxHash(response.hash)

          ReactGA.event({
            category: 'Liquidity',
            action: 'Remove',
            label: [currencyA?.symbol, currencyB?.symbol].join('/')
          })
        })
        .catch((error: Error) => {
          setAttemptingTxn(false)
          // we only care if the error is something _other_ than the user rejected the tx
          console.error(error)
        })
    }
  }

  // function modalHeader() {
  //   return (
  //     <AutoColumn gap={'md'} style={{ marginTop: '20px' }}>
  //       <RowBetween align="flex-end">
  //         <Text fontSize={24} fontWeight={500}>
  //           {parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}
  //         </Text>
  //         <RowFixed gap="4px">
  //           <CurrencyLogo currency={currencyA} size={'24px'} />
  //           <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
  //           {currencyA?.symbol}
  //           </Text>
  //         </RowFixed>
  //       </RowBetween>
  //       <RowFixed>
  //         <Plus size="16" color={theme.text2} />
  //       </RowFixed>
  //       <RowBetween align="flex-end">
  //         <Text fontSize={24} fontWeight={500}>
  //           {parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}
  //         </Text>
  //         <RowFixed gap="4px">
  //           <CurrencyLogo currency={currencyB} size={'24px'} />
  //           <Text fontSize={24} fontWeight={500} style={{ marginLeft: '10px' }}>
  //             {currencyB?.symbol}
  //           </Text>
  //         </RowFixed>
  //       </RowBetween>

  //       <TYPE.italic fontSize={12} color={theme.text2} textAlign="left" padding={'12px 0 0 0'}>
  //         {`Output is estimated. If the price changes by more than ${allowedSlippage / 100}% your transaction will revert.`}
  //       </TYPE.italic>
  //     </AutoColumn>
  //   )
  // }

  const modalHeader = () => {
    return (
      <div className="swap_card_wrap pool">
        <div className="swap_card_head">
          <article>
            <h5 className="swap_card_head_token_name">{currencyA?.symbol} - {currencyB?.symbol}</h5>
          </article>
          <article className="swap_card_head_logo">
            <div className="img_logo_wrap">
              <div className="img_logo to">
                <CurrencyLogo currency={currencyA} />
              </div>
            </div>
            <div className="line" />
            <div className="img_logo_wrap">
              <div className="img_logo from">
                <CurrencyLogo currency={currencyB} />
              </div>
            </div>
          </article>
        </div>
        <div className="swap_card_body">
          <article className="swap_card_body_info_wrap text gray">
            <p className="text sm">
              Output is estimated. If the price changes by more than <strong className="text white f_cookie">0.{allowedSlippage / 100}%</strong> your transaction will revert.
            </p>
          </article>
        </div>
      </div>
    )
  }

  function modalBottom() {
    return (
      <>
        <section className="swap_info_box">
          <ul className="swap_info">
            <li>
              <div className="info_title"><strong>{currencyA?.symbol}</strong></div>
              <div className="info_contents">
                <span className="num">{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</span>
              </div>
            </li>
            <li>
              <div className="info_title"><strong>{currencyB?.symbol}</strong></div>
              <div className="info_contents">
                <span className="num">{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</span>
              </div>
            </li>
            <li>
              <div className="info_title"><strong>{currencyA?.symbol + '/' + currencyB?.symbol}</strong> Burned</div>
              <div className="info_contents">
                <span className="num">{parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}</span>
              </div>
            </li>
            {pair && (
              <>
                <li>
                  <div className="info_title">Rate</div>
                  <div className="info_contents">
                    <div>
                      <span className="num">1</span> <strong>{currencyA?.symbol}</strong> = <span className="num">{tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}</span> <strong>{currencyB?.symbol}</strong>
                    </div>
                    <div>
                      <span className="num">1</span> <strong>{currencyB?.symbol}</strong> = <span className="num">{tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}</span> <strong>{currencyA?.symbol}</strong>
                    </div>
                  </div>
                </li>
                {/* <RowBetween>
                  <Text color={theme.text2} fontWeight={500} fontSize={16}>
                    Price
                  </Text>
                  <Text fontWeight={500} fontSize={16} color={theme.text1}>
                    1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                  </Text>
                </RowBetween>
                <RowBetween>
                  <div />
                  <Text fontWeight={500} fontSize={16} color={theme.text1}>
                    1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                  </Text>
                </RowBetween> */}
              </>
            )}
          </ul>
        </section>
        <button className={`button round lg ${!(approval === ApprovalState.APPROVED || signatureData !== null) ? "line error disabled" : "ocean"}`} onClick={onRemove}>
          Confirm
        </button>
      </>
    )
  }

  const pendingText = `Removing ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencyA?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencyB?.symbol}`

  const liquidityPercentChangeCallback = useCallback(
    (value: number) => {
      onUserInput(Field.LIQUIDITY_PERCENT, value.toString())
    },
    [onUserInput]
  )

  const oneCurrencyIsMATIC = currencyA === ETHER || currencyB === ETHER
  const oneCurrencyIsWMATIC = Boolean(
    chainId &&
      ((currencyA && currencyEquals(WETH[chainId], currencyA)) ||
        (currencyB && currencyEquals(WETH[chainId], currencyB)))
  )

  const handleSelectCurrencyA = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        history.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )
  const handleSelectCurrencyB = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, currencyIdB, history]
  )

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    setSignatureData(null) // important that we clear signature data to avoid bad sigs
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.LIQUIDITY_PERCENT, '0')
    }
    setTxHash('')
  }, [onUserInput, txHash])

  const [innerLiquidityPercentage, setInnerLiquidityPercentage] = useDebouncedChangeHandler(
    Number.parseInt(parsedAmounts[Field.LIQUIDITY_PERCENT].toFixed(0)),
    liquidityPercentChangeCallback
  )

  return (
    <>
      <AppBody id="swap">
        <AddRemoveTabs creating={false} adding={false} />
        <article className="swap_body">
          {/* <section>
            <ClickableText
              fontWeight={500}
              fontSize={14}
              onClick={() => {
                setShowDetailed(!showDetailed)
              }}
            >
              {showDetailed ? 'Simple' : 'Detailed'}
            </ClickableText>
          </section> */}
          <section className="dis_flex between amount_slider_box">
              <h6 className="text yellow">Amount</h6>
              <div className="slider">
                {!showDetailed && (
                  <Slider value={innerLiquidityPercentage} onChange={setInnerLiquidityPercentage} />
                )}
              </div>
              <strong className="f_cookie">
                {formattedAmounts[Field.LIQUIDITY_PERCENT]}%
              </strong>
          </section>
          <section className="dis_flex between gap4">
            <button className="button line md yellow w100p" onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '10')}>
              10%
            </button>
            <button className="button line md yellow w100p" onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '25')}>
              25%
            </button>
            <button className="button line md yellow w100p" onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '50')}>
              50%
            </button>
            <button className="button line md yellow w100p" onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '75')}>
              75%
            </button>
            <button className="button line md yellow w100p" onClick={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}>
              Max
            </button>
          </section>
          <br />
          {!showDetailed && (
            <>
              {chainId  && (oneCurrencyIsWMATIC || oneCurrencyIsMATIC) ? (
                <RowBetween style={{ justifyContent: 'flex-end' }}>
                  {oneCurrencyIsMATIC ? (
                    <StyledInternalLink
                      to={`/remove/${currencyA === ETHER ? WETH[chainId].address : currencyIdA}/${
                        currencyB === ETHER ? WETH[chainId].address : currencyIdB
                      }`}
                      className="label yellow"
                    >
                      Receive WMATIC
                    </StyledInternalLink>
                  ) : oneCurrencyIsWMATIC ? (
                    <StyledInternalLink
                      to={`/remove/${
                        currencyA && currencyEquals(currencyA, WETH[chainId]) ? 'MATIC' : currencyIdA
                      }/${currencyB && currencyEquals(currencyB, WETH[chainId]) ? 'MATIC' : currencyIdB}`}
                      className="label yellow"
                    >
                      Receive MATIC
                    </StyledInternalLink>
                  ) : null}
                </RowBetween>
              ) : null}
              <section className="remove_swap_info_box">
                <ul className="swap_info">
                  <li>
                    <div className="info_title">
                      <strong>{currencyA?.symbol} </strong>
                    </div>
                    <div className="info_contents">
                      <span className="num">{formattedAmounts[Field.CURRENCY_A] || '-'}</span>
                      {/* <CurrencyLogo currency={currencyA} style={{ marginRight: '12px' }} /> */}
                    </div>
                  </li>
                  <li>
                    <div className="info_title">
                      <strong>{currencyB?.symbol} </strong>
                    </div>
                    <div className="info_contents">
                      <span className="num">{formattedAmounts[Field.CURRENCY_B] || '-'}</span>
                      {/* <CurrencyLogo currency={currencyB} style={{ marginRight: '12px' }} /> */}
                    </div>
                  </li>
                  {pair && (
                    <>
                      <li>
                        <div className="info_title">
                          Rate
                        </div>
                        <div className="info_contents">
                          <div>
                            <span className="num">1</span> <strong>{currencyA?.symbol} </strong> = <span className="num">{tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'}</span> <strong>{currencyB?.symbol}</strong>
                          </div>
                          <div>
                            <span className="num">1</span> <strong>{currencyB?.symbol} </strong> = <span className="num">{tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'}</span> <strong>{currencyA?.symbol}</strong>
                          </div>
                        </div>
                      </li>
                      {/* <RowBetween>
                        Price:
                        <div>
                          1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
                        </div>
                      </RowBetween>
                      <RowBetween>
                        <div />
                        <div>
                          1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
                        </div>
                      </RowBetween> */}
                    </>
                  )}
                </ul>
              </section>
            </>
          )}
          {/* {showDetailed && (
            <>
              <CurrencyInputPanel
                value={formattedAmounts[Field.LIQUIDITY]}
                onUserInput={onLiquidityInput}
                onMax={() => {
                  onUserInput(Field.LIQUIDITY_PERCENT, '100')
                }}
                showMaxButton={!atMaxAmount}
                disableCurrencySelect
                currency={pair?.liquidityToken}
                pair={pair}
                id="swapSend"
              />
              <ColumnCenter>
                <ArrowDown size="16" color={theme.text2} />
              </ColumnCenter>
              <CurrencyInputPanel
                hideBalance={true}
                value={formattedAmounts[Field.CURRENCY_A]}
                onUserInput={onCurrencyAInput}
                onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                showMaxButton={!atMaxAmount}
                currency={currencyA}
                label={'Output'}
                onCurrencySelect={handleSelectCurrencyA}
                id="swapFrom"
              />
              <ColumnCenter style={{ marginTop: '-4px', paddingBottom: '20px' }}>
                <Plus size="16" color={theme.text2} />
              </ColumnCenter>
              <CurrencyInputPanel
                hideBalance={true}
                value={formattedAmounts[Field.CURRENCY_B]}
                onUserInput={onCurrencyBInput}
                onMax={() => onUserInput(Field.LIQUIDITY_PERCENT, '100')}
                showMaxButton={!atMaxAmount}
                currency={currencyB}
                label={'Output'}
                onCurrencySelect={handleSelectCurrencyB}
                id="swapTo"
              />
            </>
          )} */}
          {pair ? (
            <MinimalPositionCard showUnwrapped={oneCurrencyIsWMATIC} pair={pair} />
          ) : null}
        </article>
        <article className="swap_foot">
          <div className="swap_button_box">
            {!account ? (
              <button type="button" className="button lg blue" onClick={toggleWalletModal}>Connect Wallet</button>
            ) : (
              <div className="dis_flex gap4">
                {(formattedAmounts[Field.CURRENCY_A] && formattedAmounts[Field.CURRENCY_B]) && 
                  <ButtonConfirmed
                    onClick={onAttemptToApprove}
                    confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
                    disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
                    className={`button lg round green ${approval === ApprovalState.PENDING ? "" : approval === ApprovalState.APPROVED || signatureData !== null ? "dis_none" : ""}`}
                  >
                    {approval === ApprovalState.PENDING ? (
                      <Dots>Approving</Dots>
                    ) : approval === ApprovalState.APPROVED || signatureData !== null ? (
                      'Approved'
                    ) : (
                      'Approve'
                    )}
                  </ButtonConfirmed>
                }
                
                <ButtonError
                  onClick={() => {
                    setShowConfirm(true)
                  }}
                  disabled={!isValid || (signatureData === null && approval !== ApprovalState.APPROVED)}
                  error={!isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]}
                  className={`button lg round ${error ? "disabled" : "ocean"} ${(signatureData === null && approval !== ApprovalState.APPROVED) ? "dis_none" : ""}`}
                >
                  {error || 'Remove'}
                </ButtonError>
              </div>
            )}
          </div>
        </article>
      </AppBody>
      <TransactionConfirmationModal
        isOpen={showConfirm}
        onDismiss={handleDismissConfirmation}
        attemptingTxn={attemptingTxn}
        hash={txHash ? txHash : ''}
        content={() => (
          <ConfirmationModalContent
            title={'You will receive'}
            onDismiss={handleDismissConfirmation}
            topContent={modalHeader}
            bottomContent={modalBottom}
          />
        )}
        pendingText={pendingText}
      />
    </>
  )
}
