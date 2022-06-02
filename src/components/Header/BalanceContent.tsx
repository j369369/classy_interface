import { ChainId, TokenAmount } from '@uniswap/sdk'
import React, { useMemo } from 'react'
import { X } from 'react-feather'
import styled from 'styled-components'
import tokenLogo from '../../assets/images/token-logo.png'
import { UNI } from '../../constants'
import { useTotalSupply } from '../../data/TotalSupply'
import { useActiveWeb3React } from '../../hooks'
import { useMerkleDistributorContract } from '../../hooks/useContract'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { useTotalUniEarned } from '../../state/stake/hooks'
import { useAggregateUniBalance, useTokenBalance } from '../../state/wallet/hooks'
import { ExternalLink, StyledInternalLink, TYPE, UniTokenAnimated } from '../../theme'
import { computeUniCirculation } from '../../utils/computeUniCirculation'
import useUSDCPrice from '../../utils/useUSDCPrice'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { Break, CardNoise, CardSection, DataCard } from '../earn/styled'
import { CURRENCIES } from '../../constants';
import { ExternalLink as LinkIcon } from 'react-feather'

import CloseIcon from '../Modal/CloseIcon'
import '../Modal/Modal.css'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
`

const ModalUpper = styled(DataCard)`
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  //background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #021d43 100%);
  background: none;
  padding: 1rem;
`

const StyledClose = styled(X)`
  position: absolute;
  right: 16px;
  top: 16px;

  :hover {
    cursor: pointer;
  }
`

const TokenInfoWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  width: 100%;
`

/**
 * Content for balance stats modal
 */
export default function BalanceContent({ setShowUniBalanceModal }: { setShowUniBalanceModal: any }) {
  const { account, chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined

  const total = useAggregateUniBalance()
  const uniBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, uni)
  const uniToClaim: TokenAmount | undefined = useTotalUniEarned()

  const totalSupply: TokenAmount | undefined = useTotalSupply(uni)
  const uniPrice = useUSDCPrice(uni)
  const blockTimestamp = useCurrentBlockTimestamp()
  const unclaimedUni = useTokenBalance(useMerkleDistributorContract()?.address, uni)
  const circulation: TokenAmount | undefined = useMemo(
    () =>
      blockTimestamp && uni && chainId === ChainId.MATIC
        ? computeUniCirculation(uni, blockTimestamp, unclaimedUni)
        : totalSupply,
    [blockTimestamp, chainId, totalSupply, unclaimedUni, uni]
  )

  return (
    <div className="modal_container">
      <section className="modal_head">
        <h4>Your {CURRENCIES} Breakdown</h4>
        <CloseIcon close={() => setShowUniBalanceModal(false)} />
      </section>
      <section className="modal_body">
        <div className="m_card">
          {/* <UniTokenAnimated width="48px" src={tokenLogo} />{' '} */}
          {account && (
            <article className="dis_flex between">
              <h5 className="text gray">{CURRENCIES}</h5>
              <h5 className="f_cookie">{total?.toFixed(2, { groupSeparator: ',' })}</h5>
            </article>
          )}
        </div>
        <ul className="modal_info_list">
          {account && (
            <>
              <li>
                <div className="info_title">Balance</div>
                <div className="info_contents">
                  <span className="num">{uniBalance?.toFixed(2, { groupSeparator: ',' })}</span>
                </div>
              </li>
              <li>
                <div className="info_title">Unclaimed</div>
                <div className="info_contents">
                  <span className="num">
                    {uniToClaim?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {uniToClaim && uniToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/uni">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </span>
                </div>
              </li>
            </>
          )}
          <li>
            <div className="info_title">{CURRENCIES} price</div>
            <div className="info_contents">
              <span className="num">{uniBalance?.toFixed(2, { groupSeparator: ',' })}</span>
            </div>
          </li>
          <li>
            <div className="info_title">{CURRENCIES} in circulation</div>
            <div className="info_contents">
              <span className="num">{circulation?.toFixed(0, { groupSeparator: ',' })}</span>
            </div>
          </li>
          <li>
            <div className="info_title">Total Supply</div>
            <div className="info_contents">
              <span className="num">{totalSupply?.toFixed(0, { groupSeparator: ',' })}</span>
            </div>
          </li>
        </ul>
        {uni && uni.chainId === ChainId.MATIC ? (
          <article className="dis_flex gap4 text aqua">
            <span className="ic_link"><LinkIcon size={16} /></span>
            <ExternalLink href={`https://uniswap.info/token/${uni.address}`} className="text aqua" style={{fontSize: '14px'}}>View {CURRENCIES} Analytics</ExternalLink>
          </article>
        ) : null}
      </section>
    </div>
  )
}
