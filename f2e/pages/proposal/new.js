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

// Wallet
import { instance as ProposalFactory } from "../../contract/ProposalFactory";
import web3 from "../../contract/web3";
import { ProposalFactoryAddress, ProposalFactoryABI } from "../../contract/ProposalFactory"

export default function NewProposal() {
  const { activeChain, switchNetwork } = useNetwork({
    chainId: chain.rinkeby.id
  })
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
  });

  const router = useRouter();
  const { data: account } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const [error, setError] = useState("");
  const [minContriInUSD, setMinContriInUSD] = useState();
  const [targetInUSD, setTargetInUSD] = useState();
  const [ETHPrice, setETHPrice] = useState(0);

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

  async function onSubmit(data) {
    console.error('[表單使用者填寫的參數]',
      data.name,
      data.description,
      data.imageUrl,
      data.target
    );

    try {
      createProposal({
        args: [
          utils.parseEther(data.target),
          data.name,
          data.description,
          data.imageUrl
        ],
        overrides: { from: account.address },
      })
    } catch (err) {
      setError(err.message);
      console.log(err);
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
  )

  const { isError: txError, isLoading: txLoading } = useWaitForTransaction({
    hash: createProposalOutput?.hash,
    onSuccess(data) {
      // return home page after tx success
      router.push("/");
    },
  })

  return (
    <div>
      <Head>
        <title>來個酷提案</title>
        <meta name="description" content="建立個酷提案" />
        <link rel="icon" href="/logo.svg" />
      </Head>
      {(txLoading || isCreateProposalLoading) &&
        <div>Loading ...</div>}
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

                <FormControl id="name">
                  <FormLabel>這個酷提案叫做什麼</FormLabel>
                  <Input
                    {...register("name", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                <FormControl id="description">
                  <FormLabel>寫下酷提案的描述</FormLabel>
                  <Textarea
                    {...register("description", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
                <FormControl id="imageUrl">
                  <FormLabel>圖案封面照</FormLabel>
                  <Input
                    {...register("imageUrl", { required: true })}
                    isDisabled={isSubmitting}
                    type="url"
                  />
                </FormControl>

                <FormControl id="target">
                  <FormLabel>目標金額</FormLabel>
                  <InputGroup>
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
                      ~$ {getETHPriceInUSD(ETHPrice, targetInUSD)}
                    </FormHelperText>
                  ) : null}
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
