import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { getEthPrice, getWEIPriceInUSD } from "../../../../utils/convert"
import { useAsync } from "react-use";
import { utils } from 'ethers'
import Preloader from '../../../../components/Preloader'
import BreadcrumbBackLink from '../../../../components/BreadcrumbBackLink'
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
  sponsorsCount,
  disabled,
  ethPrice,
  isApprovers,
  updateIsLoading,
  isLoading
}) => {
  const [errorMessageApprove, setErrorMessageApprove] = useState();
  const [callParentAlready, setCallParentAlready] = useState(false);
  const [state, newToast] = useToastHook();
  const router = useRouter();


  const onApprove = async () => {
    try {
      approveRequest({
        args: [index],
      })

    } catch (err) {
      console.error('[🚸🚸]', error);
      setErrorMessageApprove(err.message);
    }
  };

  // 與智能合約互動，請求 [同意提款]
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
    {
      onError(error) {
        handleError(error)
      },
    }
  )

  // 等待 [同意提款] 交易完成
  const { isError: txError, isLoading: txLoading } = useWaitForTransaction({
    hash: approveRequestOutput?.hash,
    onSuccess(data) {
      // 重整頁面
      newToast({
        message: '同意成功',
        status: "success"
      });
      updateIsLoading(false)
      router.reload();
    },
    onError(error) {
      handleError(error || txError)
    },
  })

  const callParent = () => {
    updateIsLoading(true)
    // setCallParentAlready(true)
  }

  if (approveRequestOutput?.hash || txLoading) {
    updateIsLoading(true, approveRequestOutput?.hash)
    // return (<>
    //   <div>
    //     <Preloader txHash={approveRequestOutput?.hash} />
    //   </div>
    // </>)
  }

  return (
    <>
      {!isLoading ?
        (<Tr
          bg={
            !request.complete
              ? useColorModeValue("gray.100", "gray.900")
              : useColorModeValue("gray.100", "gray.900")
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
            <Button
              onClick={callParent}
            >
              Test
            </Button>
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
                  bgGradient="linear(to-r, red.300,pink.400)"
                  color={"white"}
                  variant="outline"
                  _hover={{
                    bgGradient: "linear(to-r, red.200,pink.500)",
                    boxShadow: "xl",
                  }}
                  onClick={onApprove}
                  /* 
                    同意提款 可點擊條件：
                    1. 已完成募資 ( complete = true )
                    2. 是贊助者身份
                  */
                  isDisabled={disabled || (request.complete && isApprovers === 0)}
                  isLoading={txLoading}
                >
                  同意提款
                </Button>

              )}
            </HStack>
          </Td>
        </Tr>)
        : null}
    </>
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
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState(false);
  const { id } = router.query
  const chainId = 4 // Rinekby
  const { data: account } = useAccount();
  const [notProposer, setNotProposer] = useState(true);
  const [isSSR, setIsSSR] = useState(true);

  const onIsLoadingFunction = (bool, txHash = '') => {
    debug.$error('[onIsLoadingFunction]', bool, txHash)
    setIsLoading(bool || true)
    setTxHash(txHash)
    debug.$error('[isLoading]', isLoading)
  }

  const toWithdrawalPage = (id) => {
    if (!id) return
    router.push(`/proposal/${id}/requests/new`)
  }

  // 取得 [提案詳細資訊]
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

  useEffect(() => {
    if (summaryOutput) {
      setNotProposer(account?.address !== summaryOutput[4])
    }
  }, [account])

  // 取得 [提款明細]
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

  // 取得 [該錢包 dontate 金額]，以判斷是否為贊助者
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

  // useEffect(() => {
  //   debug.$log('account has change', account?.address)
  // }, [account?.address])

  useEffect(() => {
    debug.$log('[isLoading]', isLoading)
  }, [isLoading])


  return (
    <div>
      <Head>
        <title>資金使用情況</title>
        <meta name="description" content="提案資金使用明細" />
        <link rel="icon" href="logo.ico" />
      </Head>

      <main>

        {/* Skeleton */}
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

        {!isSSR && isLoading ? (
          <div id="hazel" className='preloader'>
            <Preloader txHash={txHash} />
          </div>
        ) : null}

        <BreadcrumbBackLink link={`/proposal/${id}`} />
        <div>
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
                    bgGradient="linear(to-r, red.300,pink.400)"
                    color={"white"}
                    _hover={{
                      bgGradient: "linear(to-r, red.200,pink.500)",
                      boxShadow: "xl",
                    }}
                    isDisabled={notProposer}
                    onClick={() => toWithdrawalPage(id)}
                  >
                    {
                      notProposer ? (
                        "不可提出提款請求1"
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
                          updateIsLoading={onIsLoadingFunction}
                          isLoading={isLoading}
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
                    fontSize="md"
                  >
                    😄 建立提款請求，超過 50% 贊助者同意後，所籌取的資金將會發放
                  </Text>

                  <Button
                    fontFamily={"heading"}
                    w={"full"}
                    bgGradient="linear(to-r, red.300,pink.400)"
                    color={"white"}
                    mt={5}
                    _hover={{
                      bgGradient: "linear(to-r, red.200,pink.500)",
                      boxShadow: "xl",
                    }}
                    isDisabled={notProposer}
                    onClick={() => toWithdrawalPage(id)}
                  >
                    {
                      notProposer ? (
                        "不可提出提款請求2"
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
        </div>



      </main>
    </div>
  )
}