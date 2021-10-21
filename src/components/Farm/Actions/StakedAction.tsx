import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
// import { Button, useModal, IconButton, AddIcon, MinusIcon, Skeleton, Text, Heading } from '@pancakeswap/uikit'
import { Text } from 'rebass'

import { useLocation } from 'react-router-dom'
import { BigNumber } from 'bignumber.js'
// import ConnectWalletButton from 'components/ConnectWalletButton'
// import Balance from 'components/Balance'
import { useWeb3React } from '@web3-react/core'
import { useFarmUser, useLpTokenPrice, usePriceCakeBusd } from 'state/farms/hooks'
import { fetchFarmUserDataAsync } from 'state/farms'
import { FarmWithStakedValue } from 'components/Farm/types'
import { useTranslation } from 'react-i18next'
// import { useERC20 } from 'hooks/useContract'
// import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { useAppDispatch } from 'state'
import { getAddress } from 'utils/addressHelpers'
// import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { getBalanceAmount, getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
// import useUnstakeFarms from '../../../hooks/useUnstakeFarms'
// import DepositModal from '../../DepositModal'
// import WithdrawModal from '../../WithdrawModal'
// import useStakeFarms from '../../../hooks/useStakeFarms'
// import useApproveFarm from '../../../hooks/useApproveFarm'
import { ActionContainer, ActionTitles, ActionContent } from './styles'

import { ButtonError, ButtonLight, ButtonPrimary } from 'components/Button'


const IconButtonWrapper = styled.div`
  display: flex;
`

interface StackedActionProps extends FarmWithStakedValue {
  userDataReady: boolean
  lpLabel?: string
  displayApr?: string
}

const Staked: React.FunctionComponent<StackedActionProps> = ({
  pid,
  apr,
  multiplier,
  lpSymbol,
  lpLabel,
  lpAddresses,
  quoteToken,
  token,
  userDataReady,
  displayApr,
}) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { allowance, tokenBalance, stakedBalance } = useFarmUser(pid)
  // const { onStake } = useStakeFarms(pid)
  // const { onUnstake } = useUnstakeFarms(pid)
  const location = useLocation()
  const lpPrice = useLpTokenPrice(lpSymbol)
  const cakePrice = usePriceCakeBusd()

  const isApproved = account && allowance && allowance.isGreaterThan(0)

  const lpAddress = getAddress(lpAddresses)
  // const liquidityUrlPathParts = getLiquidityUrlPathParts({
  //   quoteTokenAddress: quoteToken.address,
  //   tokenAddress: token.address,
  // })
  const addLiquidityUrl = `addLiquidity URL`

  const handleStake = async (amount: string) => {
    // await onStake(amount)
    if(account) dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
  }

  const handleUnstake = async (amount: string) => {
    // await onUnstake(amount)
    if(account) dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
  }

  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(stakedBalance)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return stakedBalanceBigNumber.toFixed(10, BigNumber.ROUND_DOWN)
    }
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0001)) {
      return getFullDisplayBalance(stakedBalance).toLocaleString()
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [stakedBalance])

  // const [onPresentDeposit] = useModal(
  //   <DepositModal
  //     max={tokenBalance}
  //     lpPrice={lpPrice}
  //     lpLabel={lpLabel}
  //     apr={apr}
  //     displayApr={displayApr}
  //     stakedBalance={stakedBalance}
  //     onConfirm={handleStake}
  //     tokenName={lpSymbol}
  //     multiplier={multiplier}
  //     addLiquidityUrl={addLiquidityUrl}
  //     cakePrice={cakePrice}
  //   />,
  // )
  // const [onPresentWithdraw] = useModal(
  //   <WithdrawModal max={stakedBalance} onConfirm={handleUnstake} tokenName={lpSymbol} />,
  // )
  // const lpContract = useERC20(lpAddress)
  const dispatch = useAppDispatch()
  // const { onApprove } = useApproveFarm(lpContract)

  // const handleApprove = useCallback(async () => {
  //   try {
  //     setRequestedApproval(true)
  //     await onApprove()
  //     // dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))

  //     setRequestedApproval(false)
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }, [onApprove, dispatch, account, pid])

  if (!account) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text color="textSubtle" fontSize="12px">
            {t('Start Farming')}
          </Text>
        </ActionTitles>
        <ActionContent>
          {/* <ConnectWalletButton width="100%" /> */}
          <Text color="textSubtle" fontSize="12px">
            {t('ConnectWalletButton')}
          </Text>
        </ActionContent>
      </ActionContainer>
    )
  }

  if (isApproved) {
    if (stakedBalance.gt(0)) {
      return (
        <ActionContainer>
          <ActionTitles>
            <Text color="secondary" fontSize="12px" pr="4px">
              {lpSymbol}
            </Text>
            <Text color="textSubtle" fontSize="12px">
              {t('Staked')}
            </Text>
          </ActionTitles>
          <ActionContent>
            <div>
              {/* <Heading>{displayBalance()}</Heading> */}
              {stakedBalance.gt(0) && lpPrice.gt(0) && (
                // <Balance
                //   fontSize="12px"
                //   color="textSubtle"
                //   decimals={2}
                //   value={getBalanceNumber(lpPrice.times(stakedBalance))}
                //   unit=" USD"
                //   prefix="~"
                // />
                test
              )}
            </div>
            <IconButtonWrapper>
              {/* <IconButton variant="secondary" onClick={onPresentWithdraw} mr="6px">
                <MinusIcon color="primary" width="14px" />
              </IconButton>
              <IconButton
                variant="secondary"
                onClick={onPresentDeposit}
                disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
              >
                <AddIcon color="primary" width="14px" />
              </IconButton> */}
            </IconButtonWrapper>
          </ActionContent>
        </ActionContainer>
      )
    }

    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize={12} >
            {t('Stake').toUpperCase()}
          </Text>
          <Text fontSize={12} >
            {lpSymbol}
          </Text>
        </ActionTitles>
        <ActionContent>
          {/* <Button
            width="100%"
            onClick={onPresentDeposit}
            variant="secondary"
            disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
          >
            {t('Stake LP')}
          </Button> */}
        </ActionContent>
      </ActionContainer>
    )
  }

  if (!userDataReady) {
    return (
      <ActionContainer>
        <ActionTitles>
          <Text fontSize={12} >
            {t('Start Farming')}
          </Text>
        </ActionTitles>
        <ActionContent>
          {/* <Skeleton width={180} marginBottom={28} marginTop={14} /> */}
        </ActionContent>
      </ActionContainer>
    )
  }

  return (
    <ActionContainer>
      <ActionTitles>
        <Text color="textSubtle" fontSize="12px">
          {t('Enable Farm')}
        </Text>
      </ActionTitles>
      <ActionContent>
        {/* <Button width="100%" disabled={requestedApproval} onClick={handleApprove} variant="secondary">
          {t('Enable')}
        </Button> */}
        enable button 
      </ActionContent>
    </ActionContainer>
  )
}

export default Staked
