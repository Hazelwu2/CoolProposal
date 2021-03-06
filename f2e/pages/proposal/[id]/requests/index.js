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
  updateIsLoading
}) => {
  const [errorMessageApprove, setErrorMessageApprove] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [state, newToast] = useToastHook();
  const router = useRouter();


  const onApprove = async () => {
    try {
      approveRequest({
        args: [index],
      })

    } catch (err) {
      console.error('[πΈπΈ]', error);
      setErrorMessageApprove(err.message);
    }
  };

  // θζΊθ½εη΄δΊεοΌθ«ζ± [εζζζ¬Ύ]
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

  // η­εΎ [εζζζ¬Ύ] δΊ€ζε?ζ
  const { isError: txError, isLoading: txLoading } = useWaitForTransaction({
    hash: approveRequestOutput?.hash,
    onSuccess(data) {
      debug.$error('[εζζε] success')
      newToast({
        message: 'εζζε',
        status: "success"
      });
      updateIsLoading(false)
    },
    onError(error) {
      handleError(error || txError)
    },
  })

  // For Test Preloader
  const callParent = () => {
    updateIsLoading(true, '0xdad15D3c466b4b349eDFA1D1be4dd3b43dd85547')

    setTimeout(() => {
      updateIsLoading(false)

    }, 30000000)
  }

  // [εζζζ¬Ύ] tx δΊ€ζε?ζεΎοΌιη₯ηΆε±€εδ»Ά Request
  if (txLoading && approveRequestOutput?.hash) {
    // ιθ¦θ¨­ε? isLoading true return
    // ε¦εζι’¨ηζΈ²ζοΌι ζηθ¦½ε¨ Crash
    if (isLoading) return
    setIsLoading(true)
    updateIsLoading(true, approveRequestOutput?.hash)
  }


  return (
    <Tr
      bg={
        !request.complete
          ? useColorModeValue("gray.100", "gray.900")
          : useColorModeValue("gray.100", "gray.900")
      }
      opacity={request.complete ? "0.4" : "1"}
    >
      <Td>{index} </Td>
      <Td letterSpacing={'2.1px'} lineHeight={'22px'}>
        {request.description}
      </Td>
      <Td isNumeric>
        {utils.formatEther(request.amount)} ETH
        <br />
        (ηΎιη΄ $ {getWEIPriceInUSD(ethPrice, request.amount)})
        <br />
        {/* For Test Preloader */}
        {/* <Button
          onClick={callParent}
        >
          ζΈ¬θ©¦ Preloader
        </Button> */}
      </Td>


      {/* εζδΊΊζΈ / ζθ΄δΊΊζΈ */}
      <Td>
        {request.approvalCount}/{sponsorsCount}
        {/* {request.approvalCount}/4 */}
      </Td>

      {/* εζζι */}
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
              label="ιι ζζ¬Ύθ«ζ±ε·²ε?ζοΌε·²ε°ζ¬Ύι ζι η΅¦ζζ‘θ"
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
                bgGradient: "linear(to-r, red.200, pink.500)",
                boxShadow: "xl",
              }}
              onClick={onApprove}
              isDisabled={disabled}
              isLoading={txLoading}
            >
              εζζζ¬Ύ
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
    setIsLoading(bool)
    setTxHash(txHash)
    debug.$error('[isLoading]', isLoading, txHash)
  }

  const toWithdrawalPage = (id) => {
    if (!id) return
    router.push(`/proposal/${id}/requests/new`)
  }

  // εεΎ [ζζ‘θ©³η΄°θ³θ¨]
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
        if (data) {
          debug.$error('ζζ¬ιε―ι²ε₯ζζ¬Ύι οΌ', account.address === data[4]
            ? 'ζε' : 'ζ²ζζ')
          // δ½Ώη¨θι’εε°ε !== ζζ‘θι’εε°εοΌη’Ίε?ζ―ε¦ηΊζζ‘θι’ε
          setNotProposer(account.address !== data[4])
          debug.$error('notProposer', notProposer)
          debug.$error('ζζ‘θηι’εε°εοΌ', data[4])

          // θ¨­ε?ζζ‘εη¨±
          setName(data[5])
        }
      }
    }
  )

  // εζι’εζιζ°ε€ζ·notProposer
  useEffect(() => {
    if (summaryOutput) {
      setNotProposer(account?.address !== summaryOutput[4])
    }
  }, [account])

  // εεΎ [ζζ¬Ύζη΄°]
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

  // εεΎ [θ©²ι’ε dontate ιι‘]οΌδ»₯ε€ζ·ζ―ε¦ηΊθ΄ε©θ
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
      console.error('[πΈπΈ]', error);
    }
  }, []);

  useEffect(() => {
    // εεΎζζ¬Ύζη΄°
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
        // debug.$error('[εεΎζζ¬Ύζη΄° summaryOutput]', summaryOutput)
      } catch (error) {
        console.error('[πΈπΈ getRequests εεΎζζ¬Ύζη΄°]', error);
      }
    }

    getRequests()
  }, [requestOutput])

  useEffect(() => {
    setIsSSR(false)
  }, [id])

  useEffect(() => {
    if (summaryOutput) {
      setNotProposer(account?.address !== summaryOutput[4])
    }
  }, [account?.address])

  return (
    <div>
      <Head>
        <title>θ³ιδ½Ώη¨ζζ³</title>
        <meta name="description" content="ζζ‘θ³ιδ½Ώη¨ζη΄°" />
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

        {!isSSR && id && isLoading && (
          <div id="hazel" position={'fixed'} zIndex={'9'}>
            <Preloader txHash={txHash} />
          </div>
        )}

        {!isSSR && id && requestsList.length > 0 && summaryOutput?.length > 0 ? (
          <Container
            px={{ base: "4", md: "12" }}
            maxW={"7xl"}
            align={"left"}
            display={isLoading ? 'none' : 'block'}
          >
            <BreadcrumbBackLink link={`/proposal/${id}`} />
            <Flex flexDirection={{ base: "column", lg: "row" }} py={4} justify={'space-between'}>

              {/* ζζ¬Ύζη΄° */}
              <Box py="2" pr="2">
                <Heading
                  textAlign={useBreakpointValue({ base: "left" })}
                  fontFamily={"heading"}
                  color={useColorModeValue("gray.800", "white")}
                  as="h3"
                  maxW={"3xl"}
                >
                  {name} ζζ¬Ύζη΄°
                </Heading>
              </Box>
              {/* ζεΊζζ¬Ύθ«ζ±ζι */}
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
                  position={'relative'}
                >
                  {
                    notProposer ? (
                      "δΈε―ζεΊζζ¬Ύθ«ζ±"
                    ) : (
                      "ζεΊζζ¬Ύθ«ζ±"
                    )
                  }
                </Button>
              </Box>
            </Flex>

            {/* ζζ¬Ύθ‘¨ζ Ό */}
            <Box>
              <Table>
                <Thead>
                  <Tr>
                    <Th>η·¨θ</Th>
                    <Th w="30%">ζζ¬Ύεε </Th>
                    <Th isNumeric>ζζ¬Ύιι‘</Th>
                    <Th>εζδΊΊζΈ / θ΄ε©δΊΊζΈ</Th>
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
                        sponsorsCount={parseInt(summaryOutput[11])}
                        /* 
                        εζζζ¬Ύ disableζ’δ»ΆοΌ
                        1. ε·²ε?ζζζ¬Ύ ( complete = true )
                        2. ιθ΄ε©θθΊ«δ»½ (θ΄ε©ιι‘ηΊ0)
                        */
                        disabled={(request.complete || parseInt(isApprovers?._hex) === 0)}
                        ethPrice={ethPrice}
                        updateIsLoading={onIsLoadingFunction}
                      />
                    );
                  })}
                </Tbody>
                <TableCaption textAlign="left" ml="-2">
                  θ³δ»ηΊζ­’οΌε±η³θ«δΊ {requestCount} ζ¬‘ζζ¬Ύ
                </TableCaption>
              </Table>
            </Box>

          </Container>
        ) : (
          <div>
            <BreadcrumbBackLink link={`/proposal/${id}`} />
            <Container
              maxW={"lg"}
              align={"center"}
              display={
                id && requestsList?.length === 0 && !requestIsLoading ? "block" : "none"
              }
            >
              <SimpleGrid row spacing={2} align="center">
                <Stack align="center">
                  η‘δ»»δ½ζζ¬Ύθ«ζ±
                </Stack>
                <Heading
                  textAlign={"center"}
                  color={useColorModeValue("gray.800", "white")}
                  as="h4"
                  size="md"
                >
                  {name} ε°ζͺζδ»»δ½ζζ¬Ύθ«ζ±
                </Heading>
                <Text
                  textAlign={useBreakpointValue({ base: "center" })}
                  color={useColorModeValue("gray.600", "gray.300")}
                  fontSize="md"
                >
                  π ε»Ίη«ζζ¬Ύθ«ζ±οΌθΆι 50% θ΄ε©θεζεΎοΌζη±εηθ³ιε°ζηΌζΎ
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
                      "δΈε―ζεΊζζ¬Ύθ«ζ±"
                    ) : (
                      "ζεΊζζ¬Ύθ«ζ±"
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
                    εδΈδΈι 
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