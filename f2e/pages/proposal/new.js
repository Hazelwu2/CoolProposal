import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useAsync } from "react-use";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { useForm, Controller } from "react-hook-form";
// DateTime
import { registerLocale, setDefaultLocale, addMonths } from "react-datepicker";
import zhTW from 'date-fns/locale/zh-TW';
import dayjs from 'dayjs'
registerLocale('zh-TW', zhTW)
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
  Tooltip
  // NumberInput,
  // NumberInputField,
  // NumberInputStepper,
  // NumberIncrementStepper,
  // NumberDecrementStepper,
} from "@chakra-ui/react";
import { ArrowBackIcon, InfoIcon } from "@chakra-ui/icons";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Wallet
import web3 from "../../contract/web3";
import { proposalFactory } from "../../contract/ProposalFactory"
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
    control,
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
  const [isSSR, setIsSSR] = useState(true);

  useEffect(() => {
    const subscription = watch((value) => debug.$error(value));
    return () => subscription.unsubscribe();
  }, [watch])

  useEffect(() => {
    setIsSSR(false)
  }, [])

  useAsync(async () => {
    try {
      const result = await getEthPrice();
      setETHPrice(result);
    } catch (error) {
      console.error('[????????]', error);
    }
  }, []);

  useEffect(() => {
    if (activeChain && switchNetwork && activeChain.id !== chain.rinkeby.id) {
      switchNetwork();
    }
  }, [activeChain, switchNetwork])

  // ????????????
  async function onSubmit({ name, description, imageUrl, target, minAmount, deadline }) {
    debug.$log('[1]', utils.parseEther(target))
    debug.$log('[2]', utils.parseEther(minAmount))
    try {
      debug.$log('deadline', deadline, dayjs(deadline).unix())
      createProposal({
        args: [
          utils.parseEther(target),
          name,
          description,
          imageUrl,
          utils.parseEther(minAmount),
          dayjs(deadline).unix()
          // dayjs().add(5, 'minutes').unix()
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
      addressOrName: proposalFactory.address,
      contractInterface: proposalFactory.abi,
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
        message: '????????????',
        status: "success"
      });
      debug.$error('onSuccess', data)
      router.push("/");
    },
    onError(error) {
      handleError(error || txError)
    },
  })

  if (createProposalOutput?.hash || txLoading) {
    return (<>
      <div>
        <Preloader txHash={createProposalOutput?.hash} />
      </div>
    </>)
  }

  return (
    <div>
      <Head>
        <title>???????????????</title>
        <meta name="description" content="???????????????" />
        <link rel="icon" href="/logo.svg" />
      </Head>

      {!isSSR && (
        <main>
          <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6} mb={24}>
            <Text fontSize={"lg"} color={"teal.400"}>
              <ArrowBackIcon mr={2} />
              <NextLink href="/"> Back to Home</NextLink>
            </Text>
            <Stack>
              <Heading fontSize={"4xl"}>??????????????? ????</Heading>
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
                    <FormLabel>???????????????????????????</FormLabel>
                    <Input
                      {...register("name")}
                      isDisabled={isSubmitting}
                    />
                    <FormErrorMessage>
                      {errors.name?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl id="description" isRequired isInvalid={errors.description}>
                    <FormLabel>????????????????????????</FormLabel>
                    <Textarea
                      {...register("description")}
                      isDisabled={isSubmitting}
                    />
                    <FormErrorMessage>
                      {errors.description?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl id="imageUrl" isRequired isInvalid={errors.imageUrl}>
                    <FormLabel>???????????????</FormLabel>
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
                    <FormLabel>????????????</FormLabel>
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
                        ????????? $ {getETHPriceInUSD(ETHPrice, targetInUSD)}
                      </FormHelperText>
                    ) : null}

                    <FormErrorMessage>
                      {errors.target?.message}
                    </FormErrorMessage>
                  </FormControl>

                  <FormControl id="minAmount" isRequired isInvalid={errors.minAmount}>
                    <FormLabel>??????????????????</FormLabel>
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
                        ????????? $ {getETHPriceInUSD(ETHPrice, minContriInUSD)}
                      </FormHelperText>
                    ) : null}

                    <FormErrorMessage>
                      {errors.minAmount?.message}
                    </FormErrorMessage>

                  </FormControl>

                  <FormControl id="deadline" isRequired isInvalid={errors.deadline}>
                    <FormLabel>
                      ??????????????????
                      <Tooltip
                        label="?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????"
                        fontSize={"1em"}
                        px="4"
                        py="4"
                        rounded="lg"
                      >
                        <InfoIcon
                          color={useColorModeValue("teal.800", "white")}
                        />
                      </Tooltip>
                    </FormLabel>

                    <Controller
                      control={control}
                      name="deadline"
                      render={({ field }) => (
                        <DatePicker
                          placeholderText="???????????????????????????"
                          onChange={(date) => field.onChange(date)}
                          selected={field.value}
                          isDisabled={isSubmitting}
                          locale="zh-TW"
                          dateFormat="yyyy/MM/dd"
                          size="lg"
                          minDate={new Date()}
                          maxDate={dayjs().add(6, 'month').toDate()}
                          showDisabledMonthNavigation
                          className="datetime-picker"
                        />
                      )}
                    />
                    <FormErrorMessage>
                      {errors.deadline?.message}
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
                    errors.target ||
                    errors.minAmount ||
                    errors.deadline ? (
                    <Alert status="error">
                      <AlertIcon />
                      <AlertDescription mr={2}>
                        ???????????????????????????????????????????????????
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
                            ????????????????????????????????????????????????
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
      )}
    </div>
  );
}
