import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
// Walet
import { WagmiConfig, createClient } from 'wagmi'
const client = createClient()
// Component
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <WagmiConfig client={client}>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </WagmiConfig>
    </ChakraProvider>
  )
}

export default MyApp
