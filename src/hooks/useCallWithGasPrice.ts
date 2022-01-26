import { useCallback } from 'react'
import ethers, { Contract, CallOverrides } from 'ethers'
// import { useGasPrice } from 'state/user/hooks'
import { get } from 'lodash'
import { parseUnits } from 'ethers/lib/utils'

export enum GAS_PRICE {
  default = '5',
  fast = '6',
  instant = '7',
  testnet = '20',
}

export const GAS_PRICE_GWEI = {
  default: parseUnits(GAS_PRICE.default, 'gwei').toString(),
  fast: parseUnits(GAS_PRICE.fast, 'gwei').toString(),
  instant: parseUnits(GAS_PRICE.instant, 'gwei').toString(),
  testnet: parseUnits(GAS_PRICE.testnet, 'gwei').toString(),
}



export function useGasPrice(): string {
  return  GAS_PRICE_GWEI.testnet
}


/**
 * Perform a contract call with a gas price returned from useGasPrice
 * @param contract Used to perform the call
 * @param methodName The name of the method called
 * @param methodArgs An array of arguments to pass to the method
 * @param overrides An overrides object to pass to the method. gasPrice passed in here will take priority over the price returned by useGasPrice
 * @returns https://docs.ethers.io/v5/api/providers/types/#providers-TransactionReceipt
 */
export function useCallWithGasPrice() {
  const gasPrice = useGasPrice()

  const callWithGasPrice = useCallback(
    async (
      contract: Contract,
      methodName: string,
      methodArgs: any[] = [],
      overrides: CallOverrides = null!,
    ): Promise<ethers.providers.TransactionResponse> => {
      const contractMethod = get(contract, methodName)
      const hasManualGasPriceOverride = overrides?.gasPrice

      const tx = await contractMethod(
        ...methodArgs,
        hasManualGasPriceOverride ? { ...overrides } : { ...overrides, gasPrice },
      )

      return tx
    },
    [gasPrice],
  )

  return { callWithGasPrice }
}
