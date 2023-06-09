import Onboard from '@web3-onboard/core'
import { init } from '@web3-onboard/react'
import injectedModule from '@web3-onboard/injected-wallets'
import trezorModule from '@web3-onboard/trezor'
import ledgerModule from '@web3-onboard/ledger'
import walletConnectModule from '@web3-onboard/walletconnect'
import fortmaticModule from '@web3-onboard/fortmatic'
import torusModule from '@web3-onboard/torus'
import Ape from '../Ape'


const fortmatic = fortmaticModule({
    apiKey:process.env.NEXT_PUBLIC_FORTMATIC_KEY
})

const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL

const injected = injectedModule()
const walletConnect = walletConnectModule()
const torus = torusModule()
const ledger = ledgerModule()
const trezorOptions = {
  email: 'test@test.com',
  appUrl: 'https://www.blocknative.com'
}

const trezor = trezorModule(trezorOptions)


const initOnboard= init({
    wallets: [
        injected,
        ledger,
        trezor,
        walletConnect,
        
        fortmatic,
        torus
    ],
    chains: [
        // {
        //     id: '0x1',
        //     token: 'ETH',
        //     label: 'Ethereum Mainnet',
        //     rpcUrl: 'https://mainnet.infura.io/v3/ababf9851fd845d0a167825f97eeb12b'
        // },
        // {
        //     id: '0x3',
        //     token: 'tROP',
        //     label: 'Ethereum Ropsten Testnet',
        //     rpcUrl: 'https://ropsten.infura.io/v3/ababf9851fd845d0a167825f97eeb12b'
        // },
        {
            id: '0x4',
            token: 'rETH',
            label: 'Ethereum Rinkeby Testnet',
            rpcUrl: RPC_URL
        },
        // {
        //     id: '0x89',
        //     token: 'MATIC',
        //     label: 'Matic Mainnet',
        //     rpcUrl: 'https://matic-mainnet.chainstacklabs.com'
        // }
    ],
    appMetadata: {
        name: 'Nuked Apes',
        icon: Ape,
        description: 'Minting Nuked Apes',
        recommendedInjectedWallets: [
            { name: 'MetaMask', url: 'https://metamask.io' },
            { name: 'Coinbase', url: 'https://wallet.coinbase.com/' }
        ],
    }
})

export default initOnboard