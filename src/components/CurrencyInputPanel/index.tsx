import { Currency, Pair } from '@uniswap/sdk'
import React, { useState, useCallback } from 'react'
// import styled from 'styled-components'
//import { darken } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
// import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

import { useActiveWeb3React } from '../../hooks'
import { useTranslation } from 'react-i18next'

import TokenDefaultLogo from '../TokenDefaultLogo'
//import useTheme from '../../hooks/useTheme'


interface CurrencyInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  showMaxButton: boolean
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
}

export default function CurrencyInputPanel({
  value,
  onUserInput,
  onMax,
  showMaxButton,
  label = 'Input',
  onCurrencySelect,
  currency,
  disableCurrencySelect = false,
  hideBalance = false,
  pair = null, // used for double token logo
  hideInput = false,
  otherCurrency,
  id,
  showCommonBases,
  customBalanceText
}: CurrencyInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const { account } = useActiveWeb3React()
  const selectedCurrencyBalance = useCurrencyBalance(account ?? undefined, currency ?? undefined)
  //const theme = useTheme()

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      <section id={id}>
        <article className="app_form">
          {!hideInput && account && (
                <div className={`balance ${label}`}>
                  { !hideBalance && !!currency && selectedCurrencyBalance ? (
                    <div className="text mint" onClick={onMax} >
                      {customBalanceText ?? 'Balance: '}
                      <strong>{selectedCurrencyBalance?.toSignificant(6)}</strong>
                    </div>
                  ): (
                    <div className="text gray" onClick={onMax} >
                       {customBalanceText ?? 'Balance: '}
                       <strong>0</strong>
                    </div>
                  )}
                </div>
          )}
          {/* <InputRow selected={disableCurrencySelect}> */}
          <div
            // selected={!!currency}
            className="select_box"
            onClick={() => {
              if (!disableCurrencySelect) {
                setModalOpen(true)
              }
            }}
          >
            {pair ? (
              <div className="token_logo">
                <DoubleCurrencyLogo currency0={pair.token0} currency1={pair.token1} margin={true} />
              </div>
            ) : currency ? (
              <div className="token_logo">
                <CurrencyLogo currency={currency} />
              </div>
            ) : (
              <div className="token_logo">
                <TokenDefaultLogo />
              </div>
            )
            }
            {pair ? (
              <span>
                {pair?.token0.symbol}:{pair?.token1.symbol}
              </span>
            ) : (
              // <StyledTokenName className="token-symbol-container" active={Boolean(currency && currency.symbol)}>
              <h5 className="token_name">
                {
                  (currency && currency.symbol && currency.symbol.length > 20 ? 
                    currency.symbol.slice(0, 4) +
                    '...' +
                    currency.symbol.slice(currency.symbol.length - 5, currency.symbol.length)
                  : 
                    currency?.symbol
                  ) || <h5 className='none'>{t('Token')}</h5>
                }
              </h5>
            )}
            {/* {!disableCurrencySelect && <StyledDropDown selected={!!currency} />} */}
            {!disableCurrencySelect &&
              <h6 className="ic_down">
                <i className="fas fa-chevron-down"></i>
              </h6>
              }
          </div>
          {!hideInput && (
            <>
            {account && currency && showMaxButton && label !== 'To' && (
                <button type="button" className="button sm yellow max" onClick={onMax}>MAX</button>
              )}
              <NumericalInput
                className="amount_input"
                value={value}
                onUserInput={val => {
                  onUserInput(val)
                }}
              />
            </>
          )}

          <div className={`app_form_footer f_cookie ${label}`}>
            {label}
          </div>
        </article>
        
        {!disableCurrencySelect && onCurrencySelect && (
          <CurrencySearchModal
            isOpen={modalOpen}
            onDismiss={handleDismissSearch}
            onCurrencySelect={onCurrencySelect}
            selectedCurrency={currency}
            otherSelectedCurrency={otherCurrency}
            showCommonBases={showCommonBases}
          />
        )}
      </section>
    </>
  )
}
