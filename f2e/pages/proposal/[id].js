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
  CloseButton,
  FormHelperText,
  Link,
  Tabs, TabList, TabPanels, Tab, TabPanel
} from "@chakra-ui/react";
import { InfoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import Confetti from "react-confetti";
// Wallet
import { useAccount, useConnect, useContractRead, useDisconnect, useContractWrite } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
// Utils
import { getEthPrice, getETHPriceInUSD, getWEIPriceInUSD } from '../../utils/convert';
import debug from '../../utils/debug'
// Contract
import { instance as Proposal, ProposalABI } from "../../contract/Proposal"
import { useToastHook } from '../../components/Toast'


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
    { chainId: 4 },
    {watch : true},
  )

  /* 
    TODO: 尋找優化方式，使用此方式會報錯
    Warning: React has detected a change in the order of Hooks called by SingleProposal. 
    This will lead to bugs and errors if not fixed. 
    For more information, read the Rules of Hooks: 
    https://reactjs.org/link/rules-of-hooks
  */
  useEffect(() => {
    setIsSSR(false)
  }, [id])


  useAsync(async () => {
    try {
      const result = await getEthPrice();
      setEthPrice(result);
    } catch (error) {
      console.error('[🚸🚸]', error);
    }
  }, []);


  // 送出表單
  async function submitForm(data) {
    console.log(data.amount)
    try {
      debug.$error('[表單填寫的資料]', data)
      
      donate({
        overrides: {
          from: account.address,
          value: utils.parseEther(data.amount),
        },
      })

      setAmountInUSD(null);
      setIsSubmitted(true);
      setError(false);
      newToast({ message: '感謝贊助 🙏', status: "success" });

      // 重置表單
      reset({ amount: null }, { keepValues: false })
    } catch (error) {
      console.error('[🚸🚸]', error);
      setError(error.message);
    }
  }

  const showAmount = (amount) => `${utils.formatEther(amount)} ETH`
  const {
    data: donateOutput, 
    isError: isDonateError, 
    isLoading: isDonateLoading, 
    write:donate 
  } = useContractWrite(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'donate',
  )

  useEffect( () => {
    if(summaryOutput)
    {console.log("summaryOutput[3] = " ,utils.formatUnits(summaryOutput[3],"wei"))}
  },[donateOutput]);

  const target = targetAmount + ' ETH'


  return (
    <div>
      <Head>
        <title>Proposal Details</title>
        <meta name="description" content="提案詳細資訊，可贊助、查看資金使用情況" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      {!isSSR && id && summaryOutput?.length > 0 ?
        (
          <main>

            {/* 標題、描述 */}
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
                      在 Rinkeby Etherscan 檢視 <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Box>
                </Flex>
              </Container>
            </Flex>

            {/* 下方資訊 */}
            <Flex
              px={{ base: 4 }}
            >
              <Container
                as={SimpleGrid}
                maxW={"7xl"}
                columns={{ base: 1, md: 2 }}
                spacing={{ base: 10, lg: 10 }}
                py={{ base: 6 }}
              >
                <Tabs>

                  <TabList>
                    <Tab>基本資訊</Tab>
                    <Tab>資金使用情況</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      {/* 左半邊 */}
                      <Stack spacing={{ base: 6 }}>

                        <Box mx={"auto"} w={"full"}>
                          <SimpleGrid columns={{ base: 1 }} spacing={{ base: 5 }}>
                            {/* targetAmount */}
                            <InfoCard
                              title="目標集資金額"
                              content={showAmount(summaryOutput[1])}
                              tip="提案最少要募集到的金額 (ETH)"
                            />
                            {/* proposer */}
                            <InfoCard
                              title="提案人"
                              content={summaryOutput[4]}
                              tip="提案人的錢包地址"
                            />
                            {/* requestsCount */}
                            <InfoCard
                              title="同意人數"
                              content={parseInt(summaryOutput[2])}
                              tip="Number of Requests，提案人申請從合約提款，需要經過批准者的同意，贊助人數的50%"
                            />
                            {/* approversCount */}
                            <InfoCard
                              title="贊助人數"
                              content={parseInt(summaryOutput[3])}
                              tip="Number of Approvers"
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
                          您可以查看這些資金的使用情況，如果您已經捐款，您還可以批准這些提款請求
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
                            查看提款歷程
                          </Button>
                        </NextLink>
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>


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
                        <Text as="span" mr={2}>
                          進度
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
                          maxW={{ base: "	15rem", sm: "sm" }}
                          pt="2"
                        >
                          <Text as="span" fontWeight={"bold"}>
                            {summaryOutput[0] > 0
                              ? utils.formatEther(summaryOutput[0]) + ' ETH'
                              : "0, 成為第一位贊助者"
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
                          目標 {utils.formatEther(summaryOutput[1])}
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
                      贊助酷提案
                    </Heading>

                    <Box mt={10}>
                      <form onSubmit={handleSubmit(submitForm)}>
                        <FormControl id="amount">

                          <FormLabel>
                            贊助金額
                          </FormLabel>
                          <InputGroup>
                            <Input
                              {...register('amount', { required: true })}
                              isDisabled={formState.isSubmitting}
                              onChange={(e) => {
                                setAmountInUSD(Math.abs(e.target.value));
                              }}
                              type="number"
                              step="any"
                            />
                            <InputRightAddon children="ETH" />
                          </InputGroup>
                          {amountInUSD ? (
                            <FormHelperText>
                              美金約 $ {getETHPriceInUSD(ethPrice, amountInUSD)}
                            </FormHelperText>
                          ) : null}
                        </FormControl>

                        {/* 錯誤訊息 */}
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
                              bgGradient="linear(to-r, teal.300,blue.400)"
                              color={"white"}
                              isLoading={formState.isSubmitting}
                              type="submit"
                              _hover={{
                                bgGradient: "linear(to-r, teal.400,blue.400)",
                                boxShadow: "xl",
                              }}
                            >
                              贊助
                            </Button>
                          ) : (
                            <Alert status="warning" mt={4}>
                              <AlertIcon />
                              <AlertDescription mr={2}>
                                請先連接錢包，才能贊助這個酷提案
                              </AlertDescription>
                            </Alert>
                          )
                          }
                        </Stack>
                      </form>
                    </Box>
                  </Stack>
                </Stack>

              </Container>
            </Flex>
          </main>)
        : null
      }
    </div>
  )
}