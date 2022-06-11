import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
// Walet
import { WagmiConfig, createClient, configureChains, chain } from 'wagmi'
// 支援其他錢包，例：非 Metamask 錢包，用 createClient 來連結
import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
// Hardhat 測試鏈
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
// ENV
const REACT_APP_INFURA_ID = process.env.REACT_APP_INFURA_ID


// Component
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const { chains, provider, webSocketProvider } = configureChains(
  [chain.rinkeby, chain.localhost],
  [
    // 測試鏈 Hardhat
    // jsonRpcProvider({
    //   rpc: (chain) => ({
    //     http: `http://localhost:8545`,
    //   }),
    // }),
    infuraProvider({ infuraId: REACT_APP_INFURA_ID }),
    publicProvider()
  ],
)

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [new InjectedConnector({ chains })],
  provider,
})

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <WagmiConfig client={wagmiClient}>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </WagmiConfig>
    </ChakraProvider>
  )
}

export default MyApp
