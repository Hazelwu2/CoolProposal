import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { utils } from 'ethers'

import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  InputRightAddon,
  InputGroup,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Tooltip,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  CloseButton,
  FormHelperText,
  Link,
} from "@chakra-ui/react";
import { InfoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import Confetti from "react-confetti";


function InfoCard({ title, tip, content }) {
  return (
    <Stat
      bg={useColorModeValue("white", "gray.700")}
      boxShadow={"lg"}
      rounded={"xl"}
      border={"1px solid"}
      borderColor={"gray.200"}
      p={{ base: 4, sm: 6, md: 8 }}
      spacing={{ base: 8 }}
    >
      <StatLabel fontWeight={"medium"}>
        <Text as="span" isTruncated mr={2}>
          {title}
        </Text>
        <Tooltip
          bg={useColorModeValue("white", "gray.700")}
          color={useColorModeValue("gray.800", "white")}
          label={tip}
          fontSize={"1em"}
          px="4"
        >
          <InfoIcon
            color={useColorModeValue("teal.800", "white")}
          />
        </Tooltip>
      </StatLabel>
      <StatNumber
        fontSize={"base"}
        fontWeight={"bold"}
        isTruncated
        maxW={{ base: "	10rem", sm: "sm" }}
      >
        {content}
      </StatNumber>
    </Stat>
  )
}

export default function SingleProposal({
  name, desc, id, balance
}) {
  return (
    <div>
      <Head>
        <title>Proposal Details</title>
        <meta name="description" content="Create a Withdrawal Request" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      <main>
        <Container
          as={SimpleGrid}
          maxW={"7xl"}
          columns={{ base: 1, md: 2 }}
          spacing={{ base: 10, lg: 32 }}
          py={{ base: 6 }}
        >
          {/* 左半邊 */}
          <Stack spacing={{ base: 6 }}>
            <Heading
              lineHeight={1.1}
              fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
            >
              {name}
            </Heading>
            <Text
              color={useColorModeValue("gray.600", "gray.200")}
              fontSize={{ base: "lg" }}
            >
              {desc}
            </Text>
            <Link
              color="teal.500"
              href={`https://rinkeby.etherscan.io/address/${id}`}
              isExternal
            >
              在 Rinkeby Etherscan 檢視 <ExternalLinkIcon mx="2px" />
            </Link>

            <Box mx={"auto"} w={"full"}>
              <SimpleGrid columns={{ base: 1 }} spacing={{ base: 5 }}>
                <InfoCard
                  title="目標"
                  content="0.002 ETH"
                  tip="目標金額"
                />
                <InfoCard
                  title="提案人"
                  content="0x977e01DDd064e404227eea9E30a5a36ABFDeF93D"
                  tip="提案人的錢包地址"
                />
                <InfoCard
                  title="請求數"
                  content="1"
                  tip="Number of Requests，提案人申請從合約提款，需要經過批准者的同意"
                />
                <InfoCard
                  title="贊助人數"
                  content="6"
                  tip="Number of Approvers"
                />
              </SimpleGrid>
            </Box>
          </Stack>

          {/* 右半邊 */}
          <Stack spacing={{ base: 4 }}>
            <Box>
              <Stat
                bg={useColorModeValue("white", "gray.700")}
                boxShadow={"lg"}
                rounded={"xl"}
                p={{ base: 4, sm: 6, md: 8 }}
                spacing={{ base: 8 }}
              >
                <StatLabel fontWeight={"medium"}>
                  <Text as="span" isTruncated mr={2}>
                    贊助
                  </Text>
                  <Tooltip
                    label="目前提案募資到的金額"
                    bg={useColorModeValue("white", "gray.700")}
                    placement={"top"}
                    color={useColorModeValue("gray.700", "white")}
                    fontSize={"1em"}
                    px="4"
                  >
                    <InfoIcon
                      color={useColorModeValue("teal.800", "white")}
                    />
                  </Tooltip>
                </StatLabel>
                <StatNumber>
                  <Box
                    fontSize={"2xl"}
                    isTruncated
                    maxW={{ base: "	15rem", sm: "sm" }}
                    pt="2"
                  >
                    <Text as="span" fontWeight={"bold"}>
                      3
                      {/* {balance > 0
                        ? utils.fromWei(balance, "ether")
                        : "0, Become a Donor 😄"} */}
                    </Text>
                    <Text
                      as="span"
                      display={"inline"}
                      pl={2}
                      fontWeight={"bold"}
                    >
                      ETH
                    </Text>
                    <Text
                      as="span"
                      fontSize="lg"
                      display={"inline"}
                      fontWeight={"normal"}
                      pl={2}
                      color={useColorModeValue("gray.500", "gray.200")}
                    >
                      ( $30 )
                      {/* (${getWEIPriceInUSD(ETHPrice, balance)}) */}
                    </Text>
                  </Box>

                  <Text
                    fontSize={"sm"}
                    fontWeight="light"
                    color={useColorModeValue("gray.500", "gray.200")}>
                    目標 ETH 10
                  </Text>
                  <Progress
                    colorScheme="teal"
                    size="sm"
                    mt={4}
                    value={3}
                    max={10}
                  // value={utils.fromWei(balance, "ether")}
                  // max={utils.fromWei(target, "ether")}
                  />
                </StatNumber>
              </Stat>
            </Box>
          </Stack>
        </Container>
      </main>
    </div>
  )
}