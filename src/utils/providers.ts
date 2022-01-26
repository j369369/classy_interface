import { ethers } from 'ethers'
// import getRpcUrl from 'utils/getRpcUrl'

// const RPC_URL = 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
const RPC_URL = 'https://rpc-mumbai.maticvigil.com'

console.log(RPC_URL)

export const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_URL)

export default null
