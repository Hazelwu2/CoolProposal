import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { utils } from 'ethers'
import { useAsync } from "react-use";
import { useForm } from "react-hook-form"
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
  Skeleton,
  FormHelperText,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TableContainer,
  Table,
  Tr,
  Th,
  Td,
  Thead,
  Tbody
} from "@chakra-ui/react";
import { InfoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import Confetti from "react-confetti";
// Wallet
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'
// Utils
import { getEthPrice, getETHPriceInUSD, getWEIPriceInUSD } from '../../utils/convert';
import debug from '../../utils/debug'
import { handleError } from '../../utils/handle-error';
import dayjs from 'dayjs'
import locale_zhTW from 'dayjs/locale/zh-tw'  // ES 2015 
dayjs.locale('zh-tw')
// Contract
import { instance as Proposal, ProposalABI } from "../../contract/Proposal"
import { useToastHook } from '../../components/Toast'
// Component
import Preloader from '../../components/Preloader'


function InfoCard({
  title, tip, content
}) {
  return (
    <Stat
      bg={useColorModeValue("white", "gray.700")}
      boxShadow={"lg"}
      rounded={"xl"}
      border={"1px solid"}
      borderColor={"gray.200"}
      p={{ base: 4, sm: 6, md: 8 }}
      spacing={{ base: 8 }}
      className="info-card"
    >
      <StatLabel fontWeight={"medium"}>
        <Text as="span" mr={2}>
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
        maxW={{ base: "	10rem", sm: "sm" }}
      >
        {content}
      </StatNumber>
    </Stat>
  )
}

const DonatorRow = (
  { index, donator, amount, donateTime, ethPrice }
) => {
  const router = useRouter();

  return (
    <Tr
    >
      <Td>{index}</Td>
      <Td>
        {donator.substr(0, 8) + "..."}
        <Tooltip
          label={donator}
          fontSize={"1em"}
          px="4"
          py="4"
          rounded="lg"
        >
          <InfoIcon
            color={useColorModeValue("teal.800", "white")}
          />
        </Tooltip>
      </Td>
      <Td isNumeric>
        {utils.formatEther(amount)} ETH
        <br />
        (????????? $ {getWEIPriceInUSD(ethPrice, amount)})
      </Td>
      <Td>
        {dayjs.unix(parseInt(donateTime._hex)).format('YYYY/MM/DD HH:mm')}
      </Td>
    </Tr>
  )
}

export default function SingleProposal() {
  const router = useRouter()
  const { id } = router.query
  const { handleSubmit, register, formState, reset } = useForm({
    mode: 'onChange'
  })
  const [amountInUSD, setAmountInUSD] = useState();
  const [targetAmount, setTargetAmount] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [error, setError] = useState()
  const { data: account } = useAccount()
  const [isSSR, setIsSSR] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [state, newToast] = useToastHook();
  const [isAfterEndTime, setIsAfterEndTime] = useState(false);
  const [formatEndTime, setFormatEndTime] = useState('');
  const [canRefund, setCanRefund] = useState(false);

  // ??????????????????????????????false???????????? donate???true?????????donate
  const checkDonateStatus = () => {
    // summaryOutput[8]??????????????????true ???????????????
    if (summaryOutput[8]) return true
    // isAfterEndTime???????????????????????????????????????????????????
    if (isAfterEndTime) return true
    return false
  }


  useAsync(async () => {
    try {
      const result = await getEthPrice();
      setEthPrice(result);
    } catch (error) {
      console.error('[????????]', error);
    }
  }, []);

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
    {
      chainId: 4,
      watch: true,
      onSuccess(data) {
        debug.$log('[data]', data)
        const endTime = parseInt(data[10]) * 1000
        const endTimeFormatDate = dayjs(endTime).format('YYYY/MM/DD mm:ss')
        setIsAfterEndTime(dayjs().isAfter(endTime))
        setFormatEndTime(endTimeFormatDate)
        setIsSSR(false)
      },
      onError(error) {
        debug.$error('[Summary]', error)
      }
    },
  )

  const {
    data: donateListOutput,
    isError: donateListError,
    isLoading: donateListIsLoading,
  } = useContractRead(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'getDonateList',
    {
      chainId: 4,
      watch: true
    },
  )

  // ????????????????????????
  const {
    data: sponsorTotalContributionOutput
  } = useContractRead(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'sponsorTotalContribution',
    {
      chainId: 4,
      args: [account?.address],
      watch: true,
      onSuccess(data) {
        debug.$log('[sponsorTotalContribution] Success', data)

        setCanRefund(parseInt(sponsorTotalContributionOutput?._hex) === 0)
        debug.$log('[canRefund]', canRefund)
      },
      onError(error) {
        debug.$log('[sponsorTotalContribution] Error', error)
      },
    },
  )


  const {
    data: donateOutput,
    isError: isDonateError,
    isLoading: isDonateLoading,
    write: donate
  } = useContractWrite(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'donate',
    {
      onError(error) {
        handleError(error)
      },
    },
  )

  const {
    data: refundOutput,
    isError: isRefundError,
    isLoading: isRefundLoading,
    write: refund
  } = useContractWrite(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'refund',
    {
      onError(error) {
        handleError(error)
      },
    },
  )

  // ?????? [?????? Donate] ????????????
  const { isError: txError, isLoading: txLoading } = useWaitForTransaction({
    hash: donateOutput?.hash,
    onSuccess(data) {
      setAmountInUSD(null);
      setIsSubmitted(true);
      setError(false);
      newToast({
        message: '???????????? ????',
        status: "success"
      });

      // ????????????
      reset({ amount: null }, { keepValues: false })
    },
    onError(error) {
      handleError(error || txError)
    },
  })

  // ?????? [?????? Refund] ????????????
  const { isError: txRefundError, isLoading: txRefundLoading } = useWaitForTransaction({
    hash: refundOutput?.hash,
    onSuccess(data) {
      newToast({
        message: '????????????',
        status: "success"
      });
    },
    onError(error) {
      handleError(error || txRefundError)
    },
  })

  // ????????????
  async function submitForm({ amount }) {
    try {
      if (summaryOutput[8] || isAfterEndTime) {
        handleError({ reason: '??????????????????????????????:)' })
        return
      }

      donate({
        overrides: {
          from: account.address,
          value: utils.parseEther(amount),
        },
      })

    } catch (error) {
      console.error('[????????]', error);
      setError(error.message);
    }
  }

  if (donateOutput?.hash && txLoading) {
    return (<>
      <div>
        <Preloader txHash={donateOutput?.hash} />
      </div>
    </>)
  }


  if (refundOutput?.hash && txRefundLoading) {
    return (<>
      <div>
        <Preloader txHash={refundOutput?.hash} />
      </div>
    </>)
  }

  const showAmount = (amount) => `${utils.formatEther(amount)} ETH`

  return (
    <div>
      <Head>
        <title>Proposal Details</title>
        <meta name="description" content="?????????????????????????????????????????????????????????" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      {!isSSR && summaryOutput?.length > 0 && sponsorTotalContributionOutput ?
        (
          <main>

            {/* ??????????????? */}
            <Flex
              px={{ base: 4 }}>
              <Container
                as={Flex}
                maxW={"6xl"}
                columns={{ base: 1 }}
                spacing={{ base: 10, lg: 10 }}
                py={{ base: 4 }}>
                <Flex flexDirection={{ base: 'column' }} py={4}>
                  <Box>

                    <Heading
                      lineHeight={1.1}
                      fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
                    >
                      {/* name */}
                      {summaryOutput[5]}
                    </Heading>
                    <Text
                      mt={2}
                      mb={2}
                      color={useColorModeValue("gray.600", "gray.200")}
                      fontSize={{ base: "lg" }}
                    >
                      {/* desc */}
                      {summaryOutput[6]}
                    </Text>
                    <Link
                      color="teal.500"
                      href={`https://rinkeby.etherscan.io/address/${id}`}
                      isExternal
                    >
                      ??? Rinkeby Etherscan ?????? <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Box>
                </Flex>
              </Container>
            </Flex>

            {/* ???????????? */}
            <Flex
              px={{ base: 4 }}
            >
              <Container
                as={SimpleGrid}
                maxW={"7xl"}
                columns={{ base: 1, md: 2 }}
                spacing={{ base: 10, lg: 10 }}
                py={{ base: 6 }}
                mb={24}
              >
                <Tabs>

                  <TabList>
                    <Tab>????????????</Tab>
                    <Tab>????????????</Tab>
                    <Tab>????????????</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      {/* ????????? */}
                      <Stack spacing={{ base: 6 }}>

                        <Box mx={"auto"} w={"full"}>
                          <SimpleGrid columns={{ base: 1 }} spacing={{ base: 5 }}>
                            {/* targetAmount */}
                            <InfoCard
                              title="??????????????????"
                              content={showAmount(summaryOutput[1])}
                              tip="????????????????????????????????? (ETH)"
                            />
                            {/* proposer */}
                            <InfoCard
                              title="?????????"
                              content={summaryOutput[4]}
                              tip="????????????????????????"
                            />

                            {/* approversCount */}
                            <InfoCard
                              title="??????????????????"
                              content={parseInt(summaryOutput[3])}
                              tip="Number of Approvers"
                            />

                            {/* minimunContribution */}
                            <InfoCard
                              title="??????????????????"
                              content={showAmount(summaryOutput[9])}
                              tip="??????????????????"
                            />

                            {/* endTime */}
                            <InfoCard
                              title="??????????????????"
                              content={formatEndTime}
                              tip="??????????????????"
                            />
                            {/* sponsorCount */}
                            <InfoCard
                              title="????????????"
                              content={parseInt(summaryOutput[11]._hex)}
                              tip="????????????"
                            />
                          </SimpleGrid>
                        </Box>
                      </Stack>
                    </TabPanel>
                    <TabPanel>
                      <Stack spacing={{ base: 6 }}>
                        <Text
                          color={useColorModeValue("gray.600", "gray.200")}
                          fontSize={{ base: "md" }}
                        >
                          ?????????????????????????????????????????????????????????????????????????????????????????????????????????
                        </Text>
                        <NextLink href={`/proposal/${id}/requests`}>
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
                            ??????????????????
                          </Button>
                        </NextLink>
                      </Stack>
                    </TabPanel>

                    {/* ???????????? */}
                    <TabPanel>
                      <Stack spacing={{ base: 6 }}>
                        <Text
                          color={useColorModeValue("gray.600", "gray.200")}
                          fontSize={{ base: "md" }}
                        >
                          ?????????????????????????????????????????????????????????????????????????????????????????????????????????
                        </Text>
                        <TableContainer>
                          <Table variant='simple' size='sm'>
                            <Thead>
                              <Tr>
                                <Th>??????</Th>
                                <Th w="30%">?????????</Th>
                                <Th isNumeric>????????????</Th>
                                <Th>????????????</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {donateListOutput?.length > 0 && donateListOutput?.map((item, index) => {
                                return (
                                  <DonatorRow
                                    key={index}
                                    index={index}
                                    donator={item.sponsor}
                                    amount={item.amount}
                                    donateTime={item.donateTime}
                                    ethPrice={ethPrice}
                                  />
                                )
                              })}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>


                {/* ????????? */}
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
                        <Text as="span" mr={2}>
                          ??????
                        </Text>
                        <Tooltip
                          label="??????????????????????????????"
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
                          maxW={{ base: "	15rem", sm: "sm" }}
                          pt="2"
                        >
                          <Text as="span" fontWeight={"bold"}>
                            {summaryOutput[0] > 0
                              ? utils.formatEther(summaryOutput[0]) + ' ETH'
                              : "0, ????????????????????????"
                            }
                          </Text>
                          <Text
                            as="span"
                            fontSize="lg"
                            display={"inline"}
                            fontWeight={"normal"}
                            pl={2}
                            color={useColorModeValue("gray.500", "gray.200")}
                          >
                            (${getWEIPriceInUSD(ethPrice,
                              // balance
                              utils.formatEther(summaryOutput[0]))})
                          </Text>
                        </Box>

                        <Text
                          fontSize={"sm"}
                          fontWeight="light"
                          color={useColorModeValue("gray.500", "gray.200")}>
                          ?????? {utils.formatEther(summaryOutput[1])} ETH
                        </Text>
                        <Progress
                          colorScheme="teal"
                          size="sm"
                          mt={4}
                          value={utils.formatEther(summaryOutput[0])}
                          max={utils.formatEther(summaryOutput[1])}
                        />
                      </StatNumber>
                    </Stat>
                  </Box>

                  {/* Donate */}
                  <Stack
                    bg={useColorModeValue("white", "gray.700")}
                    boxShadow={"lg"}
                    rounded={"xl"}
                    p={{ base: 4, sm: 6, md: 8 }}
                    spacing={{ base: 6 }}
                  >
                    <Heading
                      lineHeight={1.1}
                      fontSize={{ base: "md", sm: "md" }}
                      color={useColorModeValue("teal.600", "teal.200")}
                    >
                      ???????????????
                    </Heading>

                    <Box mt={10}>
                      <form onSubmit={handleSubmit(submitForm)}>
                        <FormControl id="amount">

                          <FormLabel>
                            ????????????
                            <Text fontSize={'sm'} color={'gray.400'}>
                              (?????????????????? {showAmount(summaryOutput[9])})
                            </Text>
                          </FormLabel>
                          <InputGroup>
                            <Input
                              {...register('amount', { required: true })}
                              isDisabled={formState.isSubmitting || checkDonateStatus()}
                              onChange={(e) => {
                                setAmountInUSD(Math.abs(e.target.value));
                              }}
                              min={utils.formatEther(summaryOutput[9])}
                              type="number"
                              step="any"
                            />
                            <InputRightAddon children="ETH" />
                          </InputGroup>
                          {amountInUSD ? (
                            <FormHelperText>
                              ????????? $ {getETHPriceInUSD(ethPrice, amountInUSD)}
                            </FormHelperText>
                          ) : null}
                        </FormControl>

                        {/* ???????????? */}
                        {error ? (
                          <Alert status="error" mt="2">
                            <AlertIcon />
                            <AlertDescription mr={2}> {error}</AlertDescription>
                          </Alert>
                        ) : null}

                        <Stack spacing={10}>
                          {account ? (
                            <Button
                              mt={4}
                              w={"full"}
                              bgGradient={checkDonateStatus() ? "linear(to-r, gray.400, gray.900)" : "linear(to-r, teal.300,blue.400)"}
                              color={"white"}
                              isLoading={formState.isSubmitting}
                              type="submit"
                              _hover={{
                                bgGradient: "linear(to-r, teal.400,blue.400)",
                                boxShadow: "xl",
                              }}
                              isDisabled={checkDonateStatus()}
                            >
                              {checkDonateStatus() ? '???????????????' : '??????'}
                            </Button>
                          ) : (
                            <Alert status="warning" mt={4}>
                              <AlertIcon />
                              <AlertDescription mr={2}>
                                ????????????????????????????????????????????????
                              </AlertDescription>
                            </Alert>
                          )
                          }
                        </Stack>
                      </form>
                    </Box>
                  </Stack>

                  {/* ?????? : ??????????????????????????????*/}
                  {!summaryOutput[8] && isAfterEndTime ? (
                    <Stack
                      bg={useColorModeValue("white", "gray.700")}
                      boxShadow={"lg"}
                      rounded={"xl"}
                      p={{ base: 4, sm: 6, md: 8 }}
                      spacing={{ base: 6 }}
                    >
                      <Heading
                        lineHeight={1.1}
                        fontSize={{ base: "md", sm: "md" }}
                        color={useColorModeValue("teal.600", "teal.200")}
                        mt={2}
                      >
                        ????????????
                      </Heading>
                      <Box mt={10}>
                        <Text
                          fontSize={"sm"}
                          fontWeight="400"
                          color={useColorModeValue("gray.500", "gray.200")}>
                          ??????????????????????????????????????????????????????????????????????????????????????????
                          ????????????????????????????????????????????????
                        </Text>

                        <Button
                          mt={4}
                          w={"full"}
                          bgGradient="linear(to-r, red.300,pink.400)"
                          color={"white"}
                          isLoading={formState.isSubmitting}
                          type="submit"
                          _hover={{
                            bgGradient: "linear(to-r, red.400,pink.400)",
                            boxShadow: "xl",
                          }}
                          onClick={refund}
                          disabled={canRefund}
                        >
                          ??????
                        </Button>

                      </Box>
                    </Stack>
                  ) : (null)
                  }
                </Stack>

              </Container>
            </Flex>
          </main>)
        : (
          <Flex
            px={{ base: 4 }}
          >
            <Container
              maxW={"6xl"}
              columns={{ base: 2 }}
              spacing={{ base: 10, lg: 10 }}
              py={{ base: 4 }}>
              <Box>
                <Skeleton height="4em" width="25rem" />
                <Skeleton mt={5} height="4em" width="full" />
                <Skeleton mt={5} height="4em" width="full" />
                <Skeleton mt={5} height="4em" width="full" />
                <Skeleton mt={5} height="6em" width="full" />
              </Box>
            </Container>
          </Flex>
        )
      }
    </div>
  )
}