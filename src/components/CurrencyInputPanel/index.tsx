import { Currency, Pair } from '@uniswap/sdk'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
//import { darken } from 'polished'
import { useCurrencyBalance } from '../../state/wallet/hooks'
import CurrencySearchModal from '../SearchModal/CurrencySearchModal'
import CurrencyLogo from '../CurrencyLogo'
import DoubleCurrencyLogo from '../DoubleLogo'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { Input as NumericalInput } from '../NumericalInput'
import { ReactComponent as DropDown } from '../../assets/images/dropdown.svg'

import { useActiveWeb3React } from '../../hooks'
import { useTranslation } from 'react-i18next'

import TokenDefaultLogo from '../TokenDefaultLogo'
//import useTheme from '../../hooks/useTheme'

// const InputRow = styled.div<{ selected: boolean }>`
//   display: flex;
//   align-items: center;
//   padding: ${({ selected }) => (selected ? '0.75rem 0.75rem 0.75rem 0.75rem' : '0.75rem 0.75rem 0.75rem 0.75rem')};
//   background: transparent;
//   color: var(--white);
//   `

// const CurrencySelect = styled.button<{ selected: boolean }>`
//   align-items: center;
//   height: 2.2rem;
//   font-size: 20px;
//   font-weight: 500;
//   background-color: transparent;
//   border-radius: 12px;
//   outline: none;
//   cursor: pointer;
//   user-select: none;
//   border: none;
//   padding: 0;

//   &.open-currency-select-button {
//     span.token-symbol-container {
//       color: var(--white)
//     }

//     span.token-symbol-container ~ svg path {
//       stroke: var(--white)
//     }
//   }
// `

// const LabelRow = styled.div`
//   ${({ theme }) => theme.flexRowNoWrap}
//   align-items: center;
//   color: ${({ theme }) => theme.text1};
//   font-size: 0.75rem;
//   line-height: 1rem;
//   padding: 0.75rem 1rem 0 1rem;
// `

// const Aligner = styled.span`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
// `

// const StyledDropDown = styled(DropDown)<{ selected: boolean }>`
//   margin: 0 0.25rem 0 0.5rem;
//   height: 35%;

//   path {
//     stroke: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
//     stroke-width: 1.5px;
//   }
// `

// const InputPanel = styled.div<{ hideInput?: boolean }>``

// const Container = styled.div<{ hideInput: boolean }>`
//   border-radius: 0.5rem;
// `

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.5rem;' : '  margin: 0 0.25rem 0 0.5rem;')}
  //font-size:  ${({ active }) => (active ? '20px' : '16px')};
  font-size:  16px;
`

// const StyledBalanceMax = styled.button`
//   margin-top: 0.25rem;
//   margin-left: 0.25rem;
//   height: 1.6rem;
//   background-color: var(--yellow);
//   border: 1px solid transparent;
//   border-radius: 0.5rem;
//   font-size: 0.75rem;
//   font-weight: 700;
//   cursor: pointer;
//   color: #f5700f;

//   @media(max-width: 768px) {
    
//   }
// `

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
        {!hideInput && account && (
              <div>
                { !hideBalance && !!currency && selectedCurrencyBalance && (
                  <div className="text gray" onClick={onMax} >
                    { (customBalanceText ?? 'Balance: ') + selectedCurrencyBalance?.toSignificant(6) }
                  </div>
                )}
              </div>
        )}
        <article className="app_form">
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
                  ) || <h6 className='none'>{t('selectToken')}</h6>
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
                <button type="button" className="button sm yellow" onClick={onMax}>MAX</button>
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

          <div className={`app_form_footer ${label}`}>
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
