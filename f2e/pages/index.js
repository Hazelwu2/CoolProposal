import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import NextLink from "next/link";
import { useEffect, useState } from "react";
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
import Proposal from '../components/Proposal';
import HowItWork from '../components/HowItWork';

export default function Home() {
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
            <NextLink href="/campaign/new" mt={{ base: 2 }}>
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
          <Proposal />

        </Box>



      </main>

    </div>
  )
}
