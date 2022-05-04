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
export default function UniBalanceContent({ setShowUniBalanceModal }: { setShowUniBalanceModal: any }) {
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
    <ContentWrapper gap="lg">
      <ModalUpper>
        {/* <CardBGImage /> */}
        <CardNoise />
        <CardSection gap="md">
          <RowBetween>
            <TYPE.title>Your {CURRENCIES} Breakdown</TYPE.title>
            <StyledClose onClick={() => setShowUniBalanceModal(false)} />
          </RowBetween>
        </CardSection>
        <Break />
        {account && (
          <>
            <CardSection gap="sm" id="infoBreakdown" className="card">
              <AutoColumn gap="md">
                <RowBetween>
                  <TokenInfoWrap>
                    <UniTokenAnimated width="48px" src={tokenLogo} />{' '}
                    <TYPE.title_B fontSize={24} fontWeight={600}>
                      {total?.toFixed(2, { groupSeparator: ',' })}
                    </TYPE.title_B>
                  </TokenInfoWrap>
                </RowBetween>
              </AutoColumn>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.title_L>Balance:</TYPE.title_L>
                  <TYPE.main>{uniBalance?.toFixed(2, { groupSeparator: ',' })}</TYPE.main>
                </RowBetween>
                {/* <RowBetween>
                  <TYPE.title_L>Unclaimed:</TYPE.title_L>
                  <TYPE.main>
                    {uniToClaim?.toFixed(4, { groupSeparator: ',' })}{' '}
                    {uniToClaim && uniToClaim.greaterThan('0') && (
                      <StyledInternalLink onClick={() => setShowUniBalanceModal(false)} to="/uni">
                        (claim)
                      </StyledInternalLink>
                    )}
                  </TYPE.main>
                </RowBetween> */}
              </AutoColumn>
            </CardSection>
            <Break />
          </>
        )}
        <CardSection gap="sm">
          <AutoColumn gap="md">
            <RowBetween>
              <TYPE.title_L>{CURRENCIES} price:</TYPE.title_L>
              <TYPE.main>${uniPrice?.toFixed(2) ?? '-'}</TYPE.main>
            </RowBetween>
            <RowBetween>
              <TYPE.title_L>{CURRENCIES} in circulation:</TYPE.title_L>
              <TYPE.main>{circulation?.toFixed(0, { groupSeparator: ',' })}</TYPE.main>
            </RowBetween>
            <RowBetween>
              <TYPE.title_L>Total Supply</TYPE.title_L>
              <TYPE.main>{totalSupply?.toFixed(0, { groupSeparator: ',' })}</TYPE.main>
            </RowBetween>
            {uni && uni.chainId === ChainId.MATIC ? (
              <ExternalLink href={`https://uniswap.info/token/${uni.address}`}>View {CURRENCIES} Analytics</ExternalLink>
            ) : null}
          </AutoColumn>
        </CardSection>
      </ModalUpper>
    </ContentWrapper>
  )
}
