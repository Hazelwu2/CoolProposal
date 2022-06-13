import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAsync } from "react-use";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
// UI
import {
  Flex,
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
  FormHelperText,
  Textarea,
  FormErrorMessage,
  // NumberInput,
  // NumberInputField,
  // NumberInputStepper,
  // NumberIncrementStepper,
  // NumberDecrementStepper,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getEthPrice, getETHPriceInUSD } from "../../utils/convert";
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
import { utils } from "ethers"
import debug from '../../utils/debug'
import Preloader from '../../components/Preloader'
import { useToastHook } from '../../components/Toast'
import { yupResolver } from '@hookform/resolvers/yup';
// Wallet
import { instance as ProposalFactory } from "../../contract/ProposalFactory";
import web3 from "../../contract/web3";
import { ProposalFactoryAddress, ProposalFactoryABI } from "../../contract/ProposalFactory"
import { handleError } from '../../utils/handle-error';
import { NewProposalSchema } from '../../utils/form-schema'

export default function NewProposal() {
  const { activeChain, switchNetwork } = useNetwork({
    chainId: chain.rinkeby.id
  })
  const {
    handleSubmit,
    register,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(NewProposalSchema)
  });

  const router = useRouter();
  const { data: account } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const [error, setError] = useState('');
  const [minContriInUSD, setMinContriInUSD] = useState();
  const [targetInUSD, setTargetInUSD] = useState();
  const [ETHPrice, setETHPrice] = useState(0);
  const [state, newToast] = useToastHook();

  useEffect(() => {
    const subscription = watch((value) => console.log(value));
    return () => subscription.unsubscribe();
  }, [watch])

  useAsync(async () => {
    try {
      const result = await getEthPrice();
      setETHPrice(result);
    } catch (error) {
      console.error('[🚸🚸]', error);
    }
  }, []);

  useEffect(() => {
    if (activeChain && switchNetwork && activeChain.id !== chain.rinkeby.id) {
      switchNetwork();
    }
  }, [activeChain, switchNetwork])

  // 送出表單
  async function onSubmit({ name, description, imageUrl, target, minAmount }) {
    try {
      createProposal({
        args: [
          utils.parseEther(target),
          name,
          description,
          imageUrl,
          utils.parseEther(minAmount)
        ],
        overrides: { from: account.address },
      })
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  }

  const {
    data: createProposalOutput,
    isError: isCreateProposalError,
    isLoading: isCreateProposalLoading,
    write: createProposal
  } = useContractWrite(
    {
      addressOrName: ProposalFactoryAddress,
      contractInterface: ProposalFactoryABI,
    },
    'createProposal',
    {
      onError(error) {
        handleError(error)
      },
    },
  )

  const { isError: txError, isLoading: txLoading } = useWaitForTransaction({
    hash: createProposalOutput?.hash,
    onSuccess(data) {
      // return home page after tx success
      newToast({
        message: '提案成功',
        status: "success"
      });
      debug.$error('onSuccess', data)
      router.push("/");
    },
    onError(error) {
      handleError(error || txError)
    },
  })

  if (isCreateProposalLoading || txLoading) {
    debug.$warn('createProposalOutput', createProposalOutput)
    return (<>
      <div>
        <Preloader txHash={createProposalOutput?.hash} />
      </div>
    </>)
  }

  return (
    <div>
      <Head>
        <title>來個酷提案</title>
        <meta name="description" content="建立個酷提案" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      <main>
        <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6}>
          <Text fontSize={"lg"} color={"teal.400"}>
            <ArrowBackIcon mr={2} />
            <NextLink href="/"> Back to Home</NextLink>
          </Text>
          <Stack>
            <Heading fontSize={"4xl"}>建立酷提案 📢</Heading>
          </Stack>
          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >

            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>

                <FormControl id="name" isRequired isInvalid={errors.name}>
                  <FormLabel>這個酷提案叫做什麼</FormLabel>
                  <Input
                    {...register("name")}
                    isDisabled={isSubmitting}
                  />
                  <FormErrorMessage>
                    {errors.name?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl id="description" isRequired isInvalid={errors.description}>
                  <FormLabel>寫下酷提案的描述</FormLabel>
                  <Textarea
                    {...register("description")}
                    isDisabled={isSubmitting}
                  />
                  <FormErrorMessage>
                    {errors.description?.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl id="imageUrl" isRequired isInvalid={errors.imageUrl}>
                  <FormLabel>提案封面照</FormLabel>
                  <Input
                    {...register("imageUrl")}
                    isDisabled={isSubmitting}
                    type="url"
                  />
                  <FormErrorMessage>
                    {errors.imageUrl?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl id="target" isRequired isInvalid={errors.target}>
                  <FormLabel>目標金額</FormLabel>
                  <InputGroup>
                    {/* <NumberInput
                      w={'100%'}
                      keepWithinRange={false}
                      clampValueOnBlur={false}
                      min={0.0001}
                      isDisabled={isSubmitting}
                      onChange={(valueAsNumber) => {
                        console.log(valueAsNumber)
                        setTargetInUSD(Math.abs(valueAsNumber));
                      }}
                      defaultValue={0.01} precision={3} step={0.01}>
                      <NumberInputField
                        {...register("target")}
                        type="number"
                      />
                    </NumberInput> */}
                    <Input
                      type="number"
                      step="any"
                      {...register("target", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setTargetInUSD(Math.abs(e.target.value));
                      }}
                    />
                    <InputRightAddon children="ETH" />

                  </InputGroup>
                  {targetInUSD ? (
                    <FormHelperText>
                      美金約 $ {getETHPriceInUSD(ETHPrice, targetInUSD)}
                    </FormHelperText>
                  ) : null}

                  <FormErrorMessage>
                    {errors.target?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl id="minAmount" isRequired isInvalid={errors.minAmount}>
                  <FormLabel>最小募資金額</FormLabel>
                  <InputGroup>
                    {/* <NumberInput
                      w={'100%'}
                      keepWithinRange={false}
                      clampValueOnBlur={false}
                      min={0.0001}
                      isDisabled={isSubmitting}
                      onChange={(valueAsNumber) => {
                        console.log(valueAsNumber)
                        setMinContriInUSD(Math.abs(valueAsNumber));
                      }}
                      defaultValue={0.01} precision={3} step={0.01}>
                      <NumberInputField
                        {...register("minAmount")}
                        type="number"
                      />
                    </NumberInput> */}
                    <Input
                      type="number"
                      step="any"
                      {...register("minAmount", { required: true })}
                      isDisabled={isSubmitting}
                      onChange={(e) => {
                        setMinContriInUSD(Math.abs(e.target.value));
                      }}
                    />
                    <InputRightAddon children="ETH" />
                  </InputGroup>

                  {minContriInUSD ? (
                    <FormHelperText>
                      美金約 $ {getETHPriceInUSD(ETHPrice, minContriInUSD)}
                    </FormHelperText>
                  ) : null}

                  <FormErrorMessage>
                    {errors.minAmount?.message}
                  </FormErrorMessage>

                </FormControl>

                {error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}> {error}</AlertDescription>
                  </Alert>
                ) : null}

                {errors.name ||
                  errors.description ||
                  errors.imageUrl ||
                  errors.target ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}>
                      耶？這些都是必填，你還有些沒填寫哦
                    </AlertDescription>
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
                      建立
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
                        連接錢包
                      </Button>
                      <Alert status="warning">
                        <AlertIcon />
                        <AlertDescription mr={2}>
                          請先連接錢包，才可建立一個酷提案
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
  );
}
