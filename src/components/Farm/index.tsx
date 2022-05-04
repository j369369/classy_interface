import { Pair, TokenAmount } from '@uniswap/sdk'
import { darken } from 'polished'
import React, { useState, useCallback } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { Text } from 'rebass'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../hooks'
import { ExternalLink, TYPE } from '../../theme'
import { ButtonPrimary,  ButtonSecondary, ButtonEmpty, ButtonOutlined,ButtonLight } from '../Button'
import { CardNoise } from '../earn/styled'

import { useDefaultBg } from '../../hooks/useColor'

import Card, {  LightCard } from '../Card'
import { AutoColumn } from '../Column'
import FarmsLogo from '../FarmsLogo'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { Dots } from '../swap/styleds'
import { FarmConfig } from '../../constants/farm/types'

import RenderReward from './reward'
import RowProps from './types'
import { getBalanceNumber,getFullDisplayBalance } from 'utils/formatBalance'
import { getAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'

import { usePriceCakeBusd,useFarmUser } from 'state/farms/hooks'


import useApproveFarm from './hooks/useApproveFarm'
import useHarvestFarm from './hooks/useHarvestFarm'
import useStakeFarms from './hooks/useStakeFarms'
import useUnstakeFarms from './hooks/useUnstakeFarms'
import {useTokenContract} from 'hooks/useContract'

import { useAppDispatch } from 'state'
import { fetchFarmUserDataAsync } from 'state/farms'

import { useTranslation } from 'react-i18next'

import { Input as NumericalInput } from '../../components/NumericalInput'
import { useWalletModalToggle } from 'state/application/hooks'
import { CURRENCIES } from '../../constants/index';


export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`

const StyledPositionCard = styled(LightCard)<{ bgColor: any }>`
  border: none;
  background: var(--bg-gradient-white-03); 
  backdrop-filter: var(--bg-filter-blur); 
  box-shadow: var(--bg-box-shadow);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 5px;

  @media(max-width: 768px) {
    padding: 0.75rem;
  }
`

const Pooltext = styled.span`
  font-size: 18px;
  font-weight: 500;
  @media(max-width: 768px) {
    font-size: 16px;
  }
  width : 20%;
`

const Pdnbap = styled.div`
  height: 0.5rem;
  @media(max-width: 768px) {
    width:100%;
    height: 0.25rem;
  }
`

/*
const StyledPositionHead = styled.section`
  display: flex;
  justify-content: space-around;
  position: relative;
  padding: 0.5rem 1rem;
  background: var(--lightBlue-04); 
  box-shadow: var(--bg-box-shadow);
  border-radius: 0.5rem;
  color: var(--white);
  font-weight: 500;
  text-align: center;
`

const StyledPositionBody = styled.section`
  display: flex;
  justify-content: space-around;
  position: relative;
  padding: 0.5rem 1rem;
  background: var(--bg-gradient-white-03); 
  backdrop-filter: var(--bg-filter-blur); 
  box-shadow: var(--bg-box-shadow);
`


const StyleRow = styled.div`
  
`
*/


interface PositionCardProps {
  pair: Pair
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
}



interface FarmProp {
  farm: FarmConfig
  showUnwrapped?: boolean
  border?: string
  stakedBalance?: TokenAmount // optional balance to indicate that liquidity is deposited in mining pool
  price:BigNumber
}

const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}


const parseRowData = (farm:any, price:any) => {
  const { token, quoteToken } = farm
    const tokenAddress = token.address
    const quoteTokenAddress = quoteToken.address
    const lpLabel = farm.lpSymbol && farm.lpSymbol.split(' ')[0].toUpperCase().replace('PANCAKE', '')

    const row: RowProps = {
      apr: {
        value: getDisplayApr(farm.apr, farm.lpRewardsApr)!,
        pid: farm.pid,
        multiplier: farm.multiplier,
        lpLabel,
        lpSymbol: farm.lpSymbol,
        tokenAddress,
        quoteTokenAddress,
        cakePrice: price,
        originalValue: farm.apr,
      },
      farm: {
        label: lpLabel,
        pid: farm.pid,
        token: farm.token,
        quoteToken: farm.quoteToken,
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData.earnings)),
        pid: farm.pid,
      },
      liquidity: {
        liquidity: farm.liquidity,
      },
      multiplier: {
        multiplier: farm.multiplier,
      },
      details: farm,
    }

    return row
}
const getLiquidityUrl  = (chainId : any , farm : any) => {
  if(farm.token.symbol === 'MATIC') return `/#/add/MATIC/${farm.quoteToken.address[chainId]}`
  else return `/#/add/${farm.token.address[chainId]}/${farm.quoteToken.address[chainId]}`
}

export const FarmRow = ({ farm, price, ...rest } : FarmProp) => {

  const { account, chainId } = useActiveWeb3React()
  const [showMore, setShowMore] = useState(false)

  const { t } = useTranslation()

  // const price = usePriceCakeBusd();
  const rowData = parseRowData(farm, price)

  // console.log(rowData.details.lpAddresses[chainId!])

  // const lpBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, createToken(chainId,rowData.details.lpAddresses))
  const userData = useFarmUser(rowData.details.pid);
  const hasStakedAmount = getFullDisplayBalance(userData.stakedBalance,18)
  const tokenBalance = getFullDisplayBalance(userData.tokenBalance)
  const earnings = getBalanceNumber(userData.earnings)
  const addLiquidityUrl = getLiquidityUrl(chainId,farm)
  const isApproved = account && userData.allowance && userData.allowance.isGreaterThan(0)

  // connect wallet 
  const toggleWalletModal = useWalletModalToggle()
 
  // approve 
  const dispatch = useAppDispatch()
  const [requestedApproval, setRequestedApproval] = useState(false)
  const {pid, lpAddresses} = farm
  const lpAddress = getAddress(lpAddresses)
  const lpContract = useTokenContract(lpAddress)
  const { onApprove } = useApproveFarm(lpContract!)
  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApprove()
      if(account) dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))

      setRequestedApproval(false)
    } catch (e) {
      console.error(e)
    }
  }, [onApprove, dispatch, account, pid])


  // harvest
  const [harvestPendingTx, setHarvestPendingTx] = useState(false)
  const { onReward } = useHarvestFarm(pid)
  
  // stake 
  const [pendingTx, setPendingTx] = useState(false)
  const [depositValue, setDepositValue] = useState('')
  const { onStake } = useStakeFarms(pid)
  const handleStake = async () => {
    await onStake(depositValue)
    if(account) dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
  }

  // unstake
  const { onUnstake } = useUnstakeFarms(pid)

  const [withdrawValue, setWithdrawValue] = useState('')
  const handleUnstake = async () => {
    await onUnstake(withdrawValue)
    if(account) dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
  }

  return (
    <>
    <StyledPositionCard bgColor={useDefaultBg()}>
      <CardNoise />
      <AutoColumn gap="12px">
        <FixedHeightRow>
          <AutoRow gap="8px">
            <FarmsLogo farm={farm} size={18} />
            <Pooltext>
              {!farm.lpSymbol ? <Dots>Loading</Dots> : `${farm.lpSymbol}`}
            </Pooltext>

            <RenderReward data={rowData} userDataReady={true}/>

          </AutoRow>
          <RowFixed gap="8px">
            <ButtonEmpty
              padding="6px 8px"
              borderRadius="12px"
              width="130px"
              fontSize={14}
              style={{ textAlign: 'right' }}
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? (
                <>
                  Manage
                  <ChevronUp size="16" style={{ marginLeft: '0.25rem' }} />
                </>
              ) : (
                <>
                  Manage
                  <ChevronDown size="16" style={{ marginLeft: '0.25rem' }} />
                </>
              )}
            </ButtonEmpty>
          </RowFixed>
        </FixedHeightRow>

        {showMore && (
          <AutoColumn gap="8px">
            <Pdnbap />
            <FixedHeightRow >
              <Text fontSize={14} fontWeight={400}>
                Your this farm lp tokens:
              </Text>
              <Text fontSize={14} fontWeight={500}>
              {tokenBalance ?? `your haven't this lp tokens`}
              </Text>
            </FixedHeightRow>
              <FixedHeightRow>
                <Text fontSize={14} fontWeight={400}>
                  has staked amount :
                </Text>
                <Text fontSize={14} fontWeight={400}>
                  {hasStakedAmount}
                </Text>
              </FixedHeightRow>
            <FixedHeightRow>
              <RowFixed>
                <Text fontSize={14} fontWeight={400}>
                  your earnings :
                </Text>
              </RowFixed>
                <RowFixed>
                  <Text fontSize={14} fontWeight={400} marginLeft={'6px'}>
                    {earnings}
                  </Text>
                  {/* <CurrencyLogo size="16px" style={{ marginLeft: '8px', width: '18px', height: '18px' }} currency={currency0} /> */}
                </RowFixed>
            </FixedHeightRow>


 
            <FixedHeightRow>
              <RowFixed>
                <ButtonSecondary>
                  <RowBetween>
                    <ExternalLink href={addLiquidityUrl}>
                      Get {farm.lpSymbol} LP
                    </ExternalLink>
                    <span> ↗</span>
                  </RowBetween>
                </ButtonSecondary> 
              </RowFixed>
            </FixedHeightRow>
            <Pdnbap />

            {
            account ? 
            isApproved ?
              <>
              <RowBetween marginTop="10px">
              <NumericalInput
                className="w-full p-3 pr-20 rounded bg-dark-700 focus:ring focus:ring-blue"
                value={depositValue}
                onUserInput={setDepositValue}
              />
              <ButtonOutlined
                  variant="outlined"
                  color="blue"
                  width="7%"
                  onClick={() => {
                    if (!new BigNumber(tokenBalance).eq(0)) {
                      setDepositValue(`${tokenBalance}`)
                    }
                  }}
                >
                  MAX
                </ButtonOutlined>
                <ButtonPrimary
                  disabled={pendingTx || !depositValue || new BigNumber(depositValue).gt(tokenBalance) || new BigNumber(depositValue).eq(0)}
                  padding="8px 8px"
                  width="48%"
                  borderRadius="8px"
                  mt="1rem"
                  onClick={handleStake}
                >
                  Deposit
                </ButtonPrimary>
              </RowBetween>

              <RowBetween marginTop="10px">
              <NumericalInput
                className="w-full p-3 pr-20 rounded bg-dark-700 focus:ring focus:ring-blue"
                value={withdrawValue}
                onUserInput={setWithdrawValue}
              />
              <ButtonOutlined
                  variant="outlined"
                  color="blue"
                  width="7%"
                  onClick={() => {
                    if (!new BigNumber(hasStakedAmount).eq(0)) {
                      setWithdrawValue(`${hasStakedAmount}`)
                    }
                  }}
                >
                  MAX
                </ButtonOutlined>
                <ButtonPrimary
                  // disabled={requestedApproval}
                  disabled={pendingTx || !withdrawValue || new BigNumber(withdrawValue).gt(hasStakedAmount) || new BigNumber(withdrawValue).eq(0)}
                  padding="8px 8px"
                  width="48%"
                  borderRadius="8px"
                  mt="1rem"
                  onClick={handleUnstake}
                >
                  Withdraw
                </ButtonPrimary>
              </RowBetween>
              <ButtonPrimary
              disabled={earnings==0 || harvestPendingTx }
              onClick={async () => {
                setHarvestPendingTx(true)
                try {
                  await onReward()
                  alert(
                    t(`Your ${CURRENCIES} earnings have been sent to your wallet!`)
                  )
                } catch (e) {
                  alert(
                    t('Please try again. Confirm the transaction and make sure you are paying enough gas!')
                  )
                  console.error(e)
                } finally {
                  setHarvestPendingTx(false)
                }
                if (account) dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
              }}
            >
              {t('Harvest')}
            </ButtonPrimary>
              </>
            :
            <ButtonPrimary
              disabled={requestedApproval}
              padding="16px 16px"
              width="100%"
              borderRadius="12px"
              mt="1rem"
              onClick={handleApprove}
              >
              ENABLE FARM
            </ButtonPrimary>
            :
            <ButtonLight onClick={toggleWalletModal}>Connect Wallet</ButtonLight>
            }
          </AutoColumn>
        )}
      </AutoColumn>
    </StyledPositionCard>
    </>
  )
}