import React, { useState, useEffect } from "react";
import Head from "next/head";
import NextLink from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { getEthPrice, getWEIPriceInUSD } from "../../../../utils/convert"
// UI
import {
  Heading,
  useBreakpointValue,
  useColorModeValue,
  Text,
  Button,
  Flex,
  Container,
  SimpleGrid,
  Box,
  Spacer,
  Table,
  Thead,
  Tbody,
  Tooltip,
  Tr,
  Th,
  Td,
  TableCaption,
  Skeleton,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  Stack,
  Link,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@chakra-ui/icons";
// Utils
import debug from '../../../../utils/debug'
// Wallet
import { useContractRead } from 'wagmi'
// Contract
import { ProposalABI } from "../../../../contract/Proposal"



export default function Requests({
  // name
}) {
  const router = useRouter()
  const [requestsList, setRequestsList] = useState([]);
  const [name, setName] = useState([]);
  const [desc, setDesc] = useState([]);
  const requestCount = 0
  const { id } = router.query

  const {
    data: summaryOutput,
    isError: summaryError,
    isLoading,
  } = useContractRead(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'getProposalSummary',
    { chainId: 4 }
  )

  // TODO: 串合約：取得提款明細

  useEffect(() => {
    if (!isLoading && summaryOutput && summaryOutput.length > 0) {
      debug.$error('cool')
      setName(summaryOutput[5])
    }
  }, [id, isLoading])


  return (
    <div>
      <Head>
        <title>資金使用情況</title>
        <meta name="description" content="提案資金使用明細" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      <main>
        <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
          <Flex flexDirection={{ base: "column", md: "row" }} py={4}>
            <Box py="4">
              <Text fontSize={"lg"} color={"teal.400"}>
                <ArrowBackIcon mr={2} />
                <NextLink href={`/proposal/${id}`}>
                  回到上一頁
                </NextLink>
              </Text>
              <Spacer />
            </Box>
          </Flex>
        </Container>

        <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
          <Flex flexDirection={{ base: "column", lg: "row" }} py={4} justify={'space-between'}>
            {/* 提款明細 */}
            <Box py="2" pr="2">
              <Heading
                textAlign={useBreakpointValue({ base: "left" })}
                fontFamily={"heading"}
                color={useColorModeValue("gray.800", "white")}
                as="h3"
                maxW={"3xl"}
              >
                {name} 提款明細
              </Heading>
            </Box>
            {/* 提出提款請求按鈕 */}
            <Box py="2">
              <NextLink href={`/proposal/${id}/requests/new`}>
                <Button
                  fontFamily={"heading"}
                  w={"full"}
                  bgGradient="linear(to-r, teal.400,blue.400)"
                  color={"white"}
                  _hover={{
                    bgGradient: "linear(to-r, teal.400,blue.400)",
                    boxShadow: "xl",
                  }}
                >
                  提出提款請求
                </Button>
              </NextLink>
            </Box>
          </Flex>

          {/* 提款表格 */}
          <Box>
            <Table>
              <Thead>
                <Tr>
                  <Th>編號</Th>
                  <Th w="30%">提款原因</Th>
                  <Th isNumeric>提款金額</Th>
                  <Th maxW="12%" isTruncated>
                    指定收款錢包地址
                  </Th>
                  <Th>同意人數</Th>
                  <Th>Approve</Th>
                  <Th>執行提款</Th>
                </Tr>
              </Thead>
              <Tbody>
                {requestsList.map((request, index) => {
                  return (
                    <RequestRow
                      key={index}
                      id={index}
                      request={request}
                      approversCount={approversCount}
                      campaignId={campaignId}
                      disabled={FundNotAvailable}
                      ETHPrice={ETHPrice}
                    />
                  );
                })}
              </Tbody>
              <TableCaption textAlign="left" ml="-2">
                至今為止，共申請了 {requestCount} 次提款
              </TableCaption>
            </Table>
          </Box>
        </Container>
      </main>
    </div>
  )
}