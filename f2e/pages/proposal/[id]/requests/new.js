
import Head from "next/head";
import NextLink from "next/link";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAsync } from "react-use";
import { useToastHook } from '../../../../components/Toast'
// UI
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  InputRightAddon,
  InputGroup,
  Alert,
  AlertIcon,
  AlertDescription,
  FormErrorMessage,
  Tooltip,
  FormHelperText,
  Textarea,
} from "@chakra-ui/react";

import { InfoIcon } from "@chakra-ui/icons";
// Wallet
import { InjectedConnector } from 'wagmi/connectors/injected'
import {
  useAccount,
  useNetwork,
  useDisconnect,
  useConnect,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
  chain
} from 'wagmi'
// Utils
import debug from '../../../../utils/debug'
import { getEthPrice, getETHPriceInUSD } from "../../../../utils/convert";
import { utils } from "ethers";
import { handleError } from '../../../../utils/handle-error';
// Contract
import { ProposalABI } from "../../../../contract/Proposal"
// Component
import Preloader from '../../../../components/Preloader'

export default function NewWithdrawal() {
  const router = useRouter()
  const { data: account } = useAccount()
  const { activeChain, switchNetwork } = useNetwork({
    chainId: chain.rinkeby.id
  })
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const [state, newToast] = useToastHook();

  const { id } = router.query
  // Form
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
  });
  const [inUSD, setInUSD] = useState();
  const [EthPrice, setETHPrice] = useState(0);
  const [error, setError] = useState('');

  useAsync(async () => {
    try {
      const result = await getEthPrice();
      debug.$error(result)
      setETHPrice(result);
    } catch (error) {
      console.error('[????????]', error);
    }
  }, [])

  useEffect(() => {
    if (activeChain && switchNetwork && activeChain.id !== chain.rinkeby.id) {
      switchNetwork();
    }
  }, [activeChain, switchNetwork])


  async function onSubmit(data) {
    try {
      createRequest({
        args: [
          data.description,
          utils.parseEther(data.value),
        ],
        overrides: { from: account.address },
      })
      debug.$error(data)
    } catch (error) {
      console.error('[????????]', error);
    }
  }

  const {
    data: createRequestOutput,
    isError: isCreateRequestError,
    isLoading: isCreateRequestLoading,
    write: createRequest
  } = useContractWrite(
    {
      addressOrName: id,
      contractInterface: ProposalABI,
    },
    'createRequest',
    {
      onError(error) {
        handleError(error)
      },
    },
  )

  const { isError: txError, isLoading: txLoading } = useWaitForTransaction({
    hash: createRequestOutput?.hash,
    onSuccess(data) {
      debug.$error(data)
      newToast({
        message: '????????????????????????',
        status: "success"
      });
      // ?????????????????????
      router.push(`/proposal/${id}/requests`);
    },
    onError(error) {
      handleError(error || txError)
    },
  })

  if (createRequestOutput?.hash || txLoading) {
    return (<>
      <div>
        <Preloader txHash={createRequestOutput?.hash} />
      </div>
    </>)
  }

  return (
    <div>
      <Head>
        <title>??????????????????</title>
        <meta name="description" content="??????????????????" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      <main>
        <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6}>
          <Text fontSize={"lg"} color={"teal.400"} justifyContent="center">
            <ArrowBackIcon mr={2} />
            <NextLink href={`/proposal/${id}/requests`}>
              ??????????????????
            </NextLink>
          </Text>
          <Stack>
            <Heading fontSize={"4xl"}>
              ????????????
            </Heading>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl id="description">
                  <FormLabel>???????????????????????????</FormLabel>
                  <Textarea
                    {...register("description", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>

                <FormControl id="value">
                  <FormLabel>????????????</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      {...register("value", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setInUSD(Math.abs(e.target.value));
                      }}
                      step="any"
                    />
                    <InputRightAddon children="ETH" />
                  </InputGroup>

                  {inUSD ? (
                    <FormHelperText>
                      ????????? $ {getETHPriceInUSD(EthPrice, inUSD)}
                    </FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl id="recipient">
                  <FormLabel htmlFor="recipient">
                    ???????????????????????????????????????????????????
                    <Tooltip
                      label="Recipient Ethereum Wallet Address?????????????????? 50 % ????????????????????????????????????????????????????????????"
                      bg={useColorModeValue("white", "gray.700")}
                      placement={"top"}
                      color={useColorModeValue("gray.700", "white")}
                      fontSize={"1em"}
                      px="4"
                    >
                      <InfoIcon
                        mx="1"
                        color={useColorModeValue("teal.800", "white")}
                      />
                    </Tooltip>

                  </FormLabel>
                  {/* <Input
                    name="recipient"
                    {...register("recipient", {
                      required: true,
                    })}
                    isDisabled={isSubmitting}
                  /> */}
                </FormControl>

                {errors.description || errors.value ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}>
                      ???????????????????????????????????????????????????
                    </AlertDescription>
                  </Alert>
                ) : null}
                {error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}> {error}</AlertDescription>
                  </Alert>
                ) : null}

                <Stack spacing={10}>
                  {account?.address ? (
                    <Button
                      bg={"teal.400"}
                      color={"white"}
                      _hover={{
                        bg: "teal.500",
                      }}
                      isLoading={isSubmitting}
                      type="submit"
                    >
                      ??????
                    </Button>
                  ) : (
                    <Stack spacing={3}>
                      <Button
                        color={"white"}
                        bg={"teal.400"}
                        _hover={{
                          bg: "teal.300",
                        }}
                        onClick={() => connect()}
                      >
                        ????????????
                      </Button>
                      <Alert status="warning">
                        <AlertIcon />
                        <AlertDescription mr={2}>
                          ???????????????????????????????????????
                        </AlertDescription>
                      </Alert>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </main>
    </div>
  )
}