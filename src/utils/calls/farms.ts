import BigNumber from 'bignumber.js'
// import { DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from 'config'
// import getGasPrice from 'utils/getGasPrice'

import {GAS_PRICE_GWEI} from 'hooks/useCallWithGasPrice'
import { BIG_TEN } from 'utils/bigNumber'

const DEFAULT_TOKEN_DECIMAL = BIG_TEN.pow(18)
const DEFAULT_GAS_LIMIT = 200000

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}


const getGasPrice = (): string => {
  // const chainId = process.env.REACT_APP_CHAIN_ID
  // const state = store.getState()
  // const userGas = state.user.gasPrice || GAS_PRICE_GWEI.default
  // return chainId === ChainId.MAINNET.toString() ? userGas : GAS_PRICE_GWEI.testnet
  return GAS_PRICE_GWEI.default
}

export const stakeFarm = async (masterChefContract:any, pid:any, amount:any) => {
  const gasPrice = getGasPrice()
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  // if (pid === 0) {
  //   const tx = await masterChefContract.enterStaking(value, { ...options, gasPrice })
  //   const receipt = await tx.wait()
  //   return receipt.status
  // }

  const tx = await masterChefContract.deposit(pid, value, { ...options, gasPrice })
  const receipt = await tx.wait()
  return receipt.status
}

export const unstakeFarm = async (masterChefContract : any, pid : any, amount : any) => {
  const gasPrice = getGasPrice()
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  // if (pid === 0) {
  //   const tx = await masterChefContract.leaveStaking(value, { ...options, gasPrice })
  //   const receipt = await tx.wait()
  //   return receipt.status
  // }

  const tx = await masterChefContract.withdraw(pid, value, { ...options, gasPrice })
  const receipt = await tx.wait()
  return receipt.status
}

export const harvestFarm = async (masterChefContract : any, pid : any) => {
  const gasPrice = getGasPrice()
  // if (pid === 0) {
  //   const tx = await masterChefContract.leaveStaking('0', { ...options, gasPrice })
  //   const receipt = await tx.wait()
  //   return receipt.status
  // }

  const tx = await masterChefContract.deposit(pid, '0', { ...options, gasPrice })
  const receipt = await tx.wait()
  return receipt.status
}
