import React, { useState, useEffect } from "react";
import Head from "next/head";
import NextLink from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { getEthPrice, getWEIPriceInUSD } from "../../../../utils/convert"
import { useAsync } from "react-use";
import { utils } from 'ethers'
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
import { useContractRead, useAccount} from 'wagmi'
// Contract
import { instance as Proposal, ProposalABI } from "../../../../contract/Proposal"

const RequestRow = ({
  id,
  request,
  approversCount,
  disabled,
  ethPrice,
}) => {
  const router = useRouter();
  const readyToFinalize = request.approvalCount > approversCount / 2;
  const [errorMessageApprove, setErrorMessageApprove] = useState();
  const [loadingApprove, setLoadingApprove] = useState(false);

  // TODO: 串合約：贊助者同意對方提款
  const onApprove = async () => {
    setLoadingApprove(true);
    try {

      // 重整頁面
      router.reload();
    } catch (err) {
      setErrorMessageApprove(err.message);
    } finally {
      setLoadingApprove(false);
    }
  };

  return (
    <Tr
      bg={
        // readyToFinalize && !request.complete
        !request.complete
          ? useColorModeValue("blue.100", "blue.700")
          : useColorModeValue("gray.100", "gray.700")
      }
      opacity={request.complete ? "0.4" : "1"}
    >
      <Td>{id} </Td>
      <Td>{request.description}</Td>
      <Td isNumeric>
        {utils.formatEther(request.amount)} ETH
        <br />
        (美金約 $ {getWEIPriceInUSD(ethPrice, request.amount)})
      </Td>
      <Td>
        <Link
          color="teal.500"
          href={`https://rinkeby.etherscan.io/address/${request.recipient}`}
          isExternal
        >
          {" "}
          {request.recipient.substr(0, 10) + "..."}
        </Link>
      </Td>

      {/* 同意人數 / 捐贈人數 */}
      <Td>
        {request.approvalCount}/{approversCount}
      </Td>

      {/* 同意按鈕 */}
      <Td>
        <HStack spacing={2}>
          <Tooltip
            label={errorMessageApprove}
            bg={useColorModeValue("white", "gray.700")}
            placement={"top"}
            color={useColorModeValue("gray.800", "white")}
            fontSize={"1em"}
          >
            <WarningIcon
              color={useColorModeValue("red.600", "red.300")}
              display={errorMessageApprove ? "inline-block" : "none"}
            />
          </Tooltip>
          {request.complete ? (
            <Tooltip
              label="這項提款請求已完成，已將款項提領給提案者"
              bg={useColorModeValue("white", "gray.700")}
              placement={"top"}
              color={useColorModeValue("gray.800", "white")}
              fontSize={"1em"}
            >
              <CheckCircleIcon
                color={useColorModeValue("green.600", "green.300")}
              />
            </Tooltip>
          ) : (
            <Button
              bg="blue.300"
              color={"white"}
              variant="outline"
              _hover={{
                bg: "blue.600",
                color: "white",
              }}
              onClick={onApprove}
              isDisabled={disabled || request.complete || (request.approvalCount / approversCount) > 0.5}
              isLoading={loadingApprove}
            >
              同意提款
            </Button>
          )}
        </HStack>
      </Td>
    </Tr>
  );
};


export default function Requests({
}) {
  const router = useRouter()
  const [ethPrice, setEthPrice] = useState(0);
  const [requestsList, setRequestsList] = useState([]);
  const [name, setName] = useState([]);
  const [desc, setDesc] = useState([]);
  const [FundNotAvailable, setFundNotAvailable] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const { id } = router.query
  const chainId = 4 // Rinekby
  const { data: account } = useAccount();
  const [notProposer, setNotProposer] = useState(true);

  const {
    data: summaryOutput,
    isError: summaryError,
    isLoading: summaryIsLoading,
  } = useContractRead(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'getProposalSummary',
    { chainId }
  )


  const {
    data: requestOutput,
    isError: requestError,
    isLoading: requestIsLoading,
  } = useContractRead(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'getRequestsCount',
    { chainId }
  )

  // 取得提款明細
  const getRequests = async () => {
    try {
      const requestCount = parseInt(requestOutput?._hex)
      debug.$error(requestCount)
      setRequestCount(requestCount)
      const requests = await Promise.all(
        Array(parseInt(requestCount))
          .fill()
          .map((el, index) => Proposal(id).methods.requests(index).call())
      )

      setRequestsList(requests)
      debug.$error(requests)
      debug.$error(summaryOutput)
    } catch (error) {
      console.error('[🚸🚸]', error);
    }

  }

  useAsync(async () => {
    try {
      const result = await getEthPrice();
      setEthPrice(result);
    } catch (error) {
      console.error('[🚸🚸]', error);
    }
  }, []);

  useEffect(() => {
    if (!summaryIsLoading && summaryOutput && summaryOutput.length > 0) {
      setName(summaryOutput[5])
    }
    getRequests()
  }, [id, summaryIsLoading])

  useEffect(() => {
    if(account && summaryOutput){
      setNotProposer(account.address !== summaryOutput[4])
    }
  }, [account])


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

        {requestIsLoading ? (
          <Container
            px={{ base: "4", md: "12" }}
            maxW={"7xl"}
            align={"left"}
            display={'block'}
          >
            <SimpleGrid rows={{ base: 3 }} spacing={2}>
              <Skeleton height="3rem" />
              <Skeleton height="5rem" />
              <Skeleton height="5rem" />
              <Skeleton height="5rem" />
              <Skeleton height="5rem" />
            </SimpleGrid>
          </Container>

        ) : null}

        {requestsList.length > 0 ? (
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
                    isDisabled={notProposer}
                  >
                    {
                      notProposer ? (
                        "不可提出提款請求"
                      ) : (
                        "提出提款請求"
                      )
                    }
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
                    <Th maxW="12%">
                      指定收款錢包地址
                    </Th>
                    <Th>同意人數 / 贊助人數</Th>
                    <Th>Approve</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requestsList.map((request, index) => {
                    return (
                      <RequestRow
                        key={index}
                        id={index}
                        request={request}
                        approversCount={parseInt(summaryOutput[3])}
                        disabled={FundNotAvailable}
                        ethPrice={ethPrice}
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
        ) : (
          <div>
            <Container
              maxW={"lg"}
              align={"center"}
              display={
                requestsList.length === 0 && !requestIsLoading ? "block" : "none"
              }
            >
              <SimpleGrid row spacing={2} align="center">
                <Stack align="center">
                  無任何提款請求
                </Stack>
                <Heading
                  textAlign={"center"}
                  color={useColorModeValue("gray.800", "white")}
                  as="h4"
                  size="md"
                >
                  {name} 尚未有任何提款請求
                </Heading>
                <Text
                  textAlign={useBreakpointValue({ base: "center" })}
                  color={useColorModeValue("gray.600", "gray.300")}
                  fontSize="sm"
                >
                  😄 建立提款請求，提案所籌取的資金將會發放
                </Text>

                <Button
                  fontSize={"md"}
                  fontWeight={600}
                  color={"white"}
                  bg={"teal.400"}
                  _hover={{
                    bg: "teal.300",
                  }}
                  isDisabled={notProposer}
                >
                  <NextLink href={`/proposal/${id}/requests/new`}>
                    {
                      notProposer ? (
                        "不可提出提款請求"
                      ) : (
                        "提出提款請求"
                      )
                    }
                  </NextLink>
                </Button>

                <Button
                  fontSize={"md"}
                  fontWeight={600}
                  color={"white"}
                  bg={"gray.400"}
                  _hover={{
                    bg: "gray.300",
                  }}
                >
                  <NextLink href={`/proposal/${id}/`}>
                    回上一頁
                  </NextLink>
                </Button>
              </SimpleGrid>
            </Container>
          </div>
        )}
      </main>
    </div>
  )
}