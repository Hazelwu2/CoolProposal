import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { utils } from 'ethers'
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
import { useAccount, useConnect, useEnsName, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { instance as Proposal } from '../../contract/proposal'
import { getEthPrice, getWEIPriceInUSD } from '../../utils/convert';

export async function getServerSideProps({ params }) {
  const id = params.id
  const proposal = Proposal(id)
  const summary = await proposal.methods.getProposalSummary().call()
  const ethPrice = await getEthPrice()

  return {
    props: {
      id,
      balance: summary[0],
      targetAmount: summary[1],
      requestsCount: summary[2],
      approversCount: summary[3],
      proposer: summary[4],
      name: summary[5],
      desc: summary[6],
      imageUrl: summary[7],
      ethPrice
    }
  }
}

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

export default function SingleProposal({
  id,
  balance,
  targetAmount,
  requestsCount,
  approversCount,
  proposer,
  name,
  desc,
  imageUrl,
  ethPrice
  // name, desc, id, balance
}) {
  const { handleSubmit, register, formState, reset } = useForm({
    mode: 'onChange'
  })

  const [error, setError] = useState()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { data: account } = useAccount()

  // 送出表單
  async function submitForm(data) {
    console.log(data)
    try {
      // TODO: 呼叫合約方法-Donate

      setIsSubmitted(true)
      setError(false)

      // 重置表單
      reset('', { keepValues: false })
    } catch (error) {
      console.error('[🚸🚸]', error);
      setError(err)
    }
  }

  const target = utils.formatEther(targetAmount) + ' ETH'


  return (
    <div>
      <Head>
        <title>Proposal Details</title>
        <meta name="description" content="提案詳細資訊，可贊助、查看資金使用情況" />
        <link rel="icon" href="/logo.svg" />
      </Head>

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
                  {name}
                </Heading>
                <Text
                  mt={2}
                  mb={2}
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
                        <InfoCard
                          title="目標集資金額"
                          content={target}
                          tip="提案最少要募集到的金額 (ETH)"
                        />
                        <InfoCard
                          title="提案人"
                          content={proposer}
                          tip="提案人的錢包地址"
                        />
                        <InfoCard
                          title="同意人數"
                          content={requestsCount}
                          tip="Number of Requests，提案人申請從合約提款，需要經過批准者的同意，贊助人數的50%"
                        />
                        <InfoCard
                          title="贊助人數"
                          content={approversCount}
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
                        {balance > 0
                          ? utils.formatEther(balance) + ' ETH'
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
                        (${getWEIPriceInUSD(ethPrice, balance)})
                      </Text>
                    </Box>

                    <Text
                      fontSize={"sm"}
                      fontWeight="light"
                      color={useColorModeValue("gray.500", "gray.200")}>
                      目標 {target}
                    </Text>
                    <Progress
                      colorScheme="teal"
                      size="sm"
                      mt={4}
                      value={utils.formatEther(balance)}
                      max={utils.formatEther(targetAmount)}
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
                          type="number"
                          step="any"
                        />
                        <InputRightAddon children="ETH" />
                      </InputGroup>
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
      </main>
    </div>
  )
}