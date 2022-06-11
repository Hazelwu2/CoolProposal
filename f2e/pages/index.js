import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import NextLink from "next/link";
import { useEffect, useState, useCallback } from "react";
// Chakra UI
import {
  Heading,
  Button,
  useColorModeValue,
  useBreakpointValue,
  Container,
  Flex,
  Box
} from "@chakra-ui/react";
// Components
import ProposalComponent from '../components/Proposal';
import HowItWork from '../components/HowItWork';
// Web3
import { useAccount, chain, useNetwork } from 'wagmi'
import { instance as Proposal } from '../contract/Proposal'
import { instance as ProposalFactory } from '../contract/ProposalFactory'
import { getEthPrice } from '../utils/convert'
// Utils
import { checkNetwork } from '../utils/handle-error'
import debug from '../utils/debug'

export default function Home() {
  const [proposals, setProposals] = useState([])
  const [proposalList, setProposalList] = useState([])
  const [ethPrice, updateEthPrice] = useState(null);
  const { activeChain } = useNetwork({
    chainId: chain.rinkeby.id
  })

  useEffect(() => {
    async function fetchData() {
      const proposals = await ProposalFactory.methods.getProposalList().call()
      setProposals(proposals)
      debug.$log('[proposals]', proposals)
    }

    fetchData()
  }, [])


  const { data: account } = useAccount()

  async function getSummary() {
    try {
      const summary = await Promise.all(
        proposals.map((item) =>
          Proposal(item).methods.getProposalSummary().call()
        )
      );
      const ETHPrice = await getEthPrice();
      debug.$error('ethPrice', ETHPrice);
      updateEthPrice(ETHPrice);
      debug.$error("[summary] ", summary);
      setProposalList(summary);

      return summary;
    } catch (error) {
      console.error('[🚸🚸]', error);
    }
  }

  useEffect(() => {
    if (checkNetwork(activeChain)) getSummary()
    else setProposalList([])
  }, [account, activeChain, proposals]);

  return (
    <div>
      <Head>
        <title>來點酷提案</title>
        <meta
          name="description"
          content="群眾集資平台 Crowdfunding，讓美好的事物發生"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Box
          px={{ base: 4 }}
        >
          <Container align={"left"} maxW={"6xl"}>
            <Heading
              textAlign={useBreakpointValue({ base: "left" })}
              fontFamily={"heading"}
              color={useColorModeValue("gray.800", "white")}
              as="h1"
              py={4}
            >
              Crowdfunding in Blockchain，<br />讓我們集合力量，讓美好的事物發生。
            </Heading>
            <NextLink href="/proposal/new" mt={{ base: 2 }}>
              <Button
                display={{ sm: "inline-flex" }}
                fontSize={"md"}
                fontWeight={600}
                color={"white"}
                bg={"teal.400"}
                _hover={{
                  bg: "teal.300",
                }}
              >
                我有個酷提案
              </Button>
            </NextLink>
          </Container>

          <HowItWork />
          <ProposalComponent
            proposalList={proposalList}
            ethPrice={ethPrice}
            proposals={proposals}
          />

        </Box>
      </main>

    </div>
  )
}
