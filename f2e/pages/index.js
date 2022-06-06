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
        <title>群眾集資平台</title>
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

          <Proposal />

          <HowItWork />
        </Box>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>

      </main>

    </div>
  )
}
