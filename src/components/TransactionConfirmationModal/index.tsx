import { ChainId, Currency } from '@uniswap/sdk'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import Modal from '../Modal'
import { ExternalLink } from '../../theme'
import { Text } from 'rebass'
import { CustomLightSpinner } from '../../theme/components'
import { RowBetween, RowFixed } from '../Row'
import { AlertTriangle, ArrowUpCircle, CheckCircle } from 'react-feather'
import { ButtonPrimary, ButtonLight } from '../Button'
import { AutoColumn, ColumnCenter } from '../Column'
import Circle from '../../assets/images/blue-loader.svg'
import MetaMaskLogo from '../../assets/images/metamask.png'
import { getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'
import useAddTokenToMetamask from 'hooks/useAddTokenToMetamask'
import CloseIcon from '../Modal/CloseIcon'
import { ExternalLink as LinkIcon } from 'react-feather'

import ImgWaiting from '../../assets/images/img_waiting.gif'
import ImgCircleCheck from '../../assets/images/img_circle_check.svg'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const BottomSection = styled(Section)`
  background-color: ${({ theme }) => theme.bg2};
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

const StyledLogo = styled.img`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

function ConfirmationPendingContent({ onDismiss, pendingText }: { onDismiss: () => void; pendingText: any }) {
  return (
    <div className="modal_proceeding">
      <section className="modal_waiting">
        <div className="img_cont">
          <img src={ImgWaiting} className="img" alt="img" />
          <h4 className="text yellow f_cookie">Waiting For Confirmation</h4>
        </div>
        <div className="text_cont">
          {pendingText()}
        </div>
        <p className="bottom_text text aqua">Confirm this transaction in your wallet</p>
      </section>
    </div>
  )
}

function TransactionSubmittedContent({
  onDismiss,
  chainId,
  hash,
  currencyToAdd
}: {
  onDismiss: () => void
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const theme = useContext(ThemeContext)

  const { library } = useActiveWeb3React()

  const { addToken, success } = useAddTokenToMetamask(currencyToAdd)

  return (
    <div className="modal_proceeding">
      <section className="modal_transaction">
        <div className="img_cont">
          <img src={ImgCircleCheck} className="img" alt="img" />
          <h4 className="text yellow f_cookie">Transaction Submitted</h4>
        </div>
        <div className="contents">
          {chainId && hash && (
            <ExternalLink href={getEtherscanLink(chainId, hash, 'transaction')} className="text aqua">
            <span className="ic_link">
              <LinkIcon size={16} />
            </span> View on Etherscan
            </ExternalLink>
          )}
          {currencyToAdd && library?.provider?.isMetaMask && (
            <button type="button" className="button" onClick={addToken}>
              {!success ? (
                <RowFixed>
                  Add {currencyToAdd.symbol} to Metamask <StyledLogo src={MetaMaskLogo} />
                </RowFixed>
              ) : (
                <RowFixed>
                  Added {currencyToAdd.symbol}{' '}
                  <CheckCircle size={'16px'} stroke={theme.green1} style={{ marginLeft: '6px' }} />
                </RowFixed>
              )}
            </button>
          )}
          <button type="button" className="button round md yellow w100p" onClick={onDismiss}>Close</button>
        </div>
      </section>
    </div>
  )
}

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent
}: {
  title: string
  onDismiss: () => void
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <div className="modal_container">
      <section className="modal_head">
        <h4>{title}</h4>
        <CloseIcon close={onDismiss} />
      </section>
      <section className="modal_body">
        {topContent()}
        {bottomContent()}
      </section>
    </div>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const theme = useContext(ThemeContext)
  return (
    <div className="modal_container">
      <section className="modal_head">
        <h4>Error</h4>
        <CloseIcon close={onDismiss} />
      </section>
      <section className="modal_body">
        <div className="modal_error">
          <div className="modal_error_contents">
            <AlertTriangle color={theme.red1} style={{ strokeWidth: 1.5 }} size={64} />
            <p className="text red">{message}</p>
          </div>
          <button type="button" className="button round md blue w100p" onClick={onDismiss}>Dismiss</button>
        </div>
      </section>
    </div>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: any
  currencyToAdd?: Currency | undefined
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd
}: ConfirmationModalProps) {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  // confirmation screen
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} maxHeight={90}>
      {attemptingTxn ? (
        <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          onDismiss={onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content()
      )}
    </Modal>
  )
}
