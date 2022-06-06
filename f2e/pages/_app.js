import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
// Component
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Navbar />
      <Component {...pageProps} />
      <Footer />
    </ChakraProvider>
  )
}

export default MyApp
