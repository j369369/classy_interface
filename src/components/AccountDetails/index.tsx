import React, { useCallback, useContext } from 'react'
import { useDispatch } from 'react-redux'
import styled, { ThemeContext } from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import { AppDispatch } from '../../state'
import { clearAllTransactions } from '../../state/transactions/actions'
import { shortenAddress } from '../../utils'
import { AutoRow } from '../Row'
import Copy from './Copy'
import Transaction from './Transaction'

import { SUPPORTED_WALLETS } from '../../constants'
import { ReactComponent as Close } from '../../assets/images/x.svg'
import { getEtherscanLink } from '../../utils'
import { injected, walletconnect, walletlink, //fortmatic, portis 
} from '../../connectors'
import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import FortmaticIcon from '../../assets/images/fortmaticIcon.png'
import PortisIcon from '../../assets/images/portisIcon.png'
import Identicon from '../Identicon'
import { ButtonSecondary } from '../Button'
import { ExternalLink as LinkIcon } from 'react-feather'
import { ExternalLink, LinkStyledButton, TYPE } from '../../theme'

import CloseIcon from '../Modal/CloseIcon'
import '../Modal/Modal.css'

const UpperSection = styled.div`
  position: relative;
  font-family: 'CookieRun';
`

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: rgba(153, 153, 160, 0.4);
  font-weight: 700;
`

const InfoCard = styled.div`
  padding: 1rem;
  background: var(--dark-4); 
  backdrop-filter: var(--bg-filter-blur); 
  box-shadow: var(--bg-box-shadow);
  //border: 1px solid ${({ theme }) => theme.bg3};
  border-radius: 0.5rem;
  position: relative;
  display: grid;
  grid-row-gap: 12px;
  margin-bottom: 20px;
`

const AccountGroupingRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-weight: 400;

  div {
    ${({ theme }) => theme.flexRowNoWrap}
    align-items: center;
  }
`
/*
const AccountSection = styled.div`
  background-color: ${({ theme }) => theme.bg1};
  padding: 0rem 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0rem 1rem 1.5rem 1rem;`};
`
*/
const AccountSection = styled.div`
  padding: 20px;
`

const YourAccount = styled.div`
  h5 {
    margin: 0 0 1rem 0;
    font-weight: 400;
  }

  h4 {
    margin: 0;
    font-weight: 500;
  }
`

const LowerSection = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  padding: 1.5rem;
  flex-grow: 1;
  overflow: auto;
  //background-color: ${({ theme }) => theme.bg2};
  // border-bottom-left-radius: 20px;
  // border-bottom-right-radius: 20px;
    border-radius: 0.5rem;

  h5 {
    margin: 0;
    font-weight: 400;
    color: ${({ theme }) => theme.text3};
  }
`

const AccountControl = styled.div`
  display: flex;
  justify-content: space-between;
  min-width: 0;
  width: 100%;

  font-weight: 500;
  font-size: 1.25rem;

  a:hover {
    text-decoration: underline;
  }

  p {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const AddressLink = styled(ExternalLink)<{ hasENS: boolean; isENS: boolean }>`
  font-size: 0.825rem;
  color: var(--aqua);
  margin-left: 1rem;
  font-size: 0.825rem;
  display: flex;

  .ic_link { margin-right: 4px; }
`

const WalletName = styled.div`
  width: initial;
  font-size: 0.825rem;
  font-weight: 500;
  color: var(--blue-03);
`

const IconWrapper = styled.div<{ size?: number }>`
  // ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  & > img,
  span {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: flex-end;
  `};
`

const TransactionListWrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap};
`

const WalletAction = styled(ButtonSecondary)`
  width: fit-content;
  font-weight: 400;
  margin-left: 8px;
  font-size: 0.825rem;
  padding: 4px 6px;
  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`

const MainWalletAction = styled(WalletAction)`
  color: ${({ theme }) => theme.primary1};
`

function renderTransactions(transactions: string[]) {
  return (
    <div className="transactions_list">
      {transactions.map((hash, i) => {
        return <Transaction key={i} hash={hash} />
      })}
    </div>
  )
}

interface AccountDetailsProps {
  toggleWalletModal: () => void
  pendingTransactions: string[]
  confirmedTransactions: string[]
  ENSName?: string
  openOptions: () => void
}

export default function AccountDetails({
  toggleWalletModal,
  pendingTransactions,
  confirmedTransactions,
  ENSName,
  openOptions
}: AccountDetailsProps) {
  const { chainId, account, connector } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const dispatch = useDispatch<AppDispatch>()

  function formatConnectorName() {
    const { ethereum } = window
    const isMetaMask = !!(ethereum && ethereum.isMetaMask)
    const name = Object.keys(SUPPORTED_WALLETS)
      .filter(
        k =>
          SUPPORTED_WALLETS[k].connector === connector && (connector !== injected || isMetaMask === (k === 'METAMASK'))
      )
      .map(k => SUPPORTED_WALLETS[k].name)[0]
    return <h6 className="f_cookie">Connected with <span className="text yellow">{name}</span></h6>
  }

  function getStatusIcon() {
    if (connector === injected) {
      return (
        <IconWrapper size={16}>
          <Identicon />
        </IconWrapper>
      )
    } else if (connector === walletconnect) {
      return (
        <IconWrapper size={16}>
          <img src={WalletConnectIcon} alt={'wallet connect logo'} />
        </IconWrapper>
      )
    } else if (connector === walletlink) {
      return (
        <IconWrapper size={16}>
          <img src={CoinbaseWalletIcon} alt={'coinbase wallet logo'} />
        </IconWrapper>
      )
    } 
    // else if (connector === fortmatic) {
    //   return (
    //     <IconWrapper size={16}>
    //       <img src={FortmaticIcon} alt={'fortmatic logo'} />
    //     </IconWrapper>
    //   )
    // } 
    // else if (connector === portis) {
    //   return (
    //     <>
    //       <IconWrapper size={16}>
    //         <img src={PortisIcon} alt={'portis logo'} />
    //         <MainWalletAction
    //           onClick={() => {
    //             portis.portis.showPortis()
    //           }}
    //         >
    //           Show Portis
    //         </MainWalletAction>
    //       </IconWrapper>
    //     </>
    //   )
    // }
    return null
  }

  const clearAllTransactionsCallback = useCallback(() => {
    if (chainId) dispatch(clearAllTransactions({ chainId }))
  }, [dispatch, chainId])

  return (
    <>
      <div className="modal_container">
        <section className="modal_head">
          <h4>Account</h4>
          <CloseIcon close={toggleWalletModal} />
        </section>
        <section className="modal_body">
          <div className="m_card">
            <div className="dis_flex between">
              {formatConnectorName()}
              <div>
                {connector !== injected && connector !== walletlink && (
                  <button className="button round line sm yellow"
                    onClick={() => {
                      ;(connector as any).close()
                    }}
                  >
                    Disconnect
                  </button>
                )}
                <button className="button round line sm yellow"
                  onClick={() => {
                    openOptions()
                  }}
                >
                  Change
                </button>
              </div>
            </div>
            <AccountGroupingRow id="web3-account-identifier-row">
              <AccountControl>
                {ENSName ? (
                  <>
                    <div>
                      {getStatusIcon()}
                      <p> {ENSName}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="f_cookie">
                      {getStatusIcon()}
                      <p> {account && shortenAddress(account)}</p>
                    </div>
                  </>
                )}
              </AccountControl>
            </AccountGroupingRow>
            <AccountGroupingRow>
              {ENSName ? (
                <>
                  <AccountControl>
                    <div>
                      {account && (
                        <Copy toCopy={account}>
                          <span>Copy Address</span>
                        </Copy>
                      )}
                      {chainId && account && (
                        <AddressLink
                          hasENS={!!ENSName}
                          isENS={true}
                          href={chainId && getEtherscanLink(chainId, ENSName, 'address')}
                        >
                          <span className="ic_link">
                           <LinkIcon size={16} />
                          </span>
                          <span>View on Etherscan</span>
                        </AddressLink>
                      )}
                    </div>
                  </AccountControl>
                </>
              ) : (
                <>
                  <AccountControl>
                    <div>
                      {account && (
                        <Copy toCopy={account}>
                          <span>Copy Address</span>
                        </Copy>
                      )}
                      {chainId && account && (
                        <AddressLink
                          hasENS={!!ENSName}
                          isENS={false}
                          href={getEtherscanLink(chainId, account, 'address')}
                        >
                          <span className="ic_link">
                           <LinkIcon size={16} />
                          </span>
                          <span>View on Etherscan</span>
                        </AddressLink>
                      )}
                    </div>
                  </AccountControl>
                </>
              )}
            </AccountGroupingRow>
          </div>
          {!!pendingTransactions.length || !!confirmedTransactions.length ? (
            <>
              <div className="m_cont">
                <div className="dis_flex between">
                  <h5 className="f_cookie">- Recent Transactions</h5>
                  <button type="button" className="button round sm yellow" onClick={clearAllTransactionsCallback}>clear all</button>
                </div>
              </div>
              <div className="m_cont">
                {renderTransactions(pendingTransactions)}
                {renderTransactions(confirmedTransactions)}
              </div>
            </>
          ) : (
            <div className="m_cont text_center">
              <p className="text sm gray">Your transactions will appear here...</p>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
