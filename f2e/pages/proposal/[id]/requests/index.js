import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import NextLink from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/router";
import { getEthPrice, getWEIPriceInUSD } from "../../../../utils/convert"
import { useAsync } from "react-use";
import { utils } from 'ethers'
import Preloader from '../../../../components/Preloader'
import { handleError } from '../../../../utils/handle-error';
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
  HStack,
  Stack,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@chakra-ui/icons";
// Utils
import debug from '../../../../utils/debug'
import { useToastHook } from '../../../../components/Toast'
// Wallet
import { useContractRead, useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
// Contract
import { instance as Proposal, ProposalABI } from "../../../../contract/Proposal"

const RequestRow = ({
  index,
  id,
  request,
  approversCount,
  disabled,
  ethPrice,
  isApprovers
}) => {
  const [errorMessageApprove, setErrorMessageApprove] = useState();
  const [loadingApprove, setLoadingApprove] = useState(false);
  const [state, newToast] = useToastHook();
  const router = useRouter();

  const onApprove = async () => {
    setLoadingApprove(true);
    try {
      approveRequest({
        args: [index],
      })

    } catch (err) {
      setErrorMessageApprove(err.message);
    } finally {
      setLoadingApprove(false);
    }
  };

  const {
    data: approveRequestOutput,
    isError: isApproveRequestError,
    isLoading: isApproveRequestLoading,
    write: approveRequest
  } = useContractWrite(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'approveRequest',
  )

  const { isError: txError, isLoading: txLoading } = useWaitForTransaction({
    hash: approveRequestOutput?.hash,
    onSuccess(data) {
      // debug.$error(data)
      // 重整頁面
      newToast({
        message: '同意成功',
        status: "success"
      });
      router.reload();
    },
    onError(error) {
      handleError(error || txError)
    },
  })

  if (approveRequestOutput?.hash || txLoading) {
    return (<>
      <div>
        <Preloader txHash={approveRequestOutput?.hash} />
      </div>
    </>)
  }


  return (
    <Tr
      bg={
        !request.complete
          ? useColorModeValue("blue.100", "blue.700")
          : useColorModeValue("gray.100", "gray.700")
      }
      opacity={request.complete ? "0.4" : "1"}
    >
      <Td>{index} </Td>
      <Td>{request.description}</Td>
      <Td isNumeric>
        {utils.formatEther(request.amount)} ETH
        <br />
        (美金約 $ {getWEIPriceInUSD(ethPrice, request.amount)})
        <br />
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
              /* 
                同意提款 可點擊條件：
                1. 已完成募資 ( complete = true )
                2. 是贊助者身份
              */
              isDisabled={disabled || (request.complete && isApprovers === 0)}
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
  const [FundNotAvailable, setFundNotAvailable] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const { id } = router.query
  const chainId = 4 // Rinekby
  const { data: account } = useAccount();
  const [notProposer, setNotProposer] = useState(true);
  const [isSSR, setIsSSR] = useState(true);

  const toWithdrawalPage = (id) => {
    if (!id) return
    router.push(`/proposal/${id}/requests/new`)
  }

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
    {
      chainId,
      watch: true,
      onSuccess(data) {
        debug.$error('有權限可進入提款頁？', account.address === summaryOutput[4]
          ? '有啊' : '沒有捏')
        // 使用者錢包地址 !== 提案者錢包地址，確定是否為提案者錢包
        setNotProposer(account.address !== summaryOutput[4])
        debug.$error('notProposer', notProposer)
        debug.$error('提案者的錢包地址：', summaryOutput[4])

        // 設定提案名稱
        setName(summaryOutput[5])
      }
    }
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
    {
      chainId,
      watch: true
    }
  )

  const { data: isApprovers } = useContractRead(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'sponsorTotalContribution',
    {
      args: [account?.address],
      watch: true,
    },
  )



  useAsync(async () => {
    try {
      const result = await getEthPrice();
      setEthPrice(result);
    } catch (error) {
      console.error('[🚸🚸]', error);
    }
  }, []);

  useEffect(() => {

    // 取得提款明細
    async function getRequests() {
      try {
        if (!requestOutput?._hex) return
        const requestCount = parseInt(requestOutput?._hex)
        setRequestCount(requestCount)
        const requests = await Promise.all(
          Array(parseInt(requestCount))
            .fill()
            .map((el, index) => Proposal(id).methods.requests(index).call())
        )

        setRequestsList(requests)
        // debug.$error(requests)
        // debug.$error('[取得提款明細 summaryOutput]', summaryOutput)
      } catch (error) {
        console.error('[🚸🚸 getRequests 取得提款明細]', error);
      }
    }

    getRequests()
  }, [requestOutput])

  useEffect(() => {
    setIsSSR(false)
  }, [id])


  return (
    <div>
      <Head>
        <title>資金使用情況</title>
        <meta name="description" content="提案資金使用明細" />
        <link rel="icon" href="logo.ico" />
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

        {!isSSR && id && requestIsLoading ? (
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

        {!isSSR && id && requestsList.length > 0 && summaryOutput?.length > 0 ? (
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
                <Button
                  fontFamily={"heading"}
                  w={"full"}
                  bgGradient="linear(to-r, teal.400, blue.400)"
                  color={"white"}
                  _hover={{
                    bgGradient: "linear(to-r, teal.400,blue.400)",
                    boxShadow: "xl",
                  }}
                  isDisabled={notProposer}
                  onClick={() => toWithdrawalPage(id)}
                >
                  {
                    notProposer ? (
                      "不可提出提款請求"
                    ) : (
                      "提出提款請求"
                    )
                  }
                </Button>
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
                    <Th>同意人數 / 贊助人數</Th>
                    <Th>Approve</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requestsList.length > 0 && requestsList.map((request, index) => {
                    return (
                      <RequestRow
                        key={index}
                        index={index}
                        id={id}
                        request={request}
                        approversCount={parseInt(summaryOutput[3])}
                        disabled={FundNotAvailable}
                        ethPrice={ethPrice}
                        isApprovers={parseInt(isApprovers?._hex)}
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
                id && requestsList?.length === 0 && !requestIsLoading ? "block" : "none"
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
                  fontFamily={"heading"}
                  w={"full"}
                  bgGradient="linear(to-r, teal.400,blue.400)"
                  color={"white"}
                  _hover={{
                    bg: "teal.300",
                  }}
                  isDisabled={notProposer}
                  onClick={() => toWithdrawalPage(id)}
                >
                  {
                    notProposer ? (
                      "不可提出提款請求"
                    ) : (
                      "提出提款請求"
                    )
                  }
                </Button>

                <Button
                  fontSize={"md"}
                  fontWeight={600}
                  bgGradient="linear(to-r, gray.400,blue.400)"
                  color={"white"}
                  _hover={{
                    bg: "gray.500",
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