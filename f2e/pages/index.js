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
import { useAccount, useContractRead, chain, useContract } from 'wagmi'
import contract from '../../artifacts/contracts/Proposal.sol/ProposalFactory.json'
import proposalContract from '../../artifacts/contracts/Proposal.sol/Proposal.json'
import Proposal from '../contract/proposal'
import ProposalFactory from '../contract/ProposalFactory'
import { getEthPrice } from '../utils/convert'

// Server 端取得已部署的所有提案
export async function getServerSideProps() {
  const proposals = await ProposalFactory.methods.getProposalList().call()

  return {
    props: { proposals }
  }
}

export default function Home({ proposals }) {
  const [proposalList, setProposalList] = useState([])
  const [ethPrice, updateEthPrice] = useState(null);

  const { data: account } = useAccount()

  async function getSummary() {
    try {
      const summary = await Promise.all(
        proposals.map((item, i) =>
          Proposal(item).methods.getProposalSummary().call()
        )
      );
      const ETHPrice = await getEthPrice();
      console.error('[ETHPRICE]', ETHPrice)
      updateEthPrice(3);
      console.error("[summary] ", summary);
      setProposalList(summary);

      return summary;
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getSummary();
  }, []);

  return (
    <div>
      <Head>
        <title>來個酷提案</title>
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
                發起提案
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
