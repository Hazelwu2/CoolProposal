import {
  Box,
  Flex,
  Container,
  Heading,
  Stack,
  Button,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link,
  IconButton
} from '@chakra-ui/react'
import { ChevronDownIcon, InfoOutlineIcon } from "@chakra-ui/icons"
import NextLink from 'next/link'
// Component
import ModeSwitch from './ModeSwitch'
import { useToastHook } from './Toast'
// Wallet
import { useAccount, useConnect, useEnsName, useDisconnect, useNetwork, chain } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useEffect, useState } from 'react'


export default function Navbar() {
  const { activeChain, switchNetwork } = useNetwork({
    chainId: chain.rinkeby.id
  })
  const { data: account } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const [isSSR, setIsSSR] = useState(true);
  const [state, newToast] = useToastHook();
  const gitbook = 'https://ku-ti-an-de-bai-pi-shu.gitbook.io/come-up-with-a-cool-proposal/ji-ben-nei-rong/zhuan-an-nei-rong/zhuan-an-jia-zhi'


  useEffect(() => {
    setIsSSR(false);
  }, []);

  useEffect(() => {
    if (activeChain && switchNetwork && activeChain.id !== chain.rinkeby.id) {
      switchNetwork();
      newToast({
        message: '⚠錯誤網路，請切換至 Rinkby',
        status: "error",
        isClosable: false
      });
    }
  }, [activeChain, switchNetwork])

  useEffect(() => {
    if (!account?.address) newToast({
      message: '請先連接錢包',
      status: 'warning',
      isClosable: false
    })
  }, [])

  return (
    <Box>
      <Flex
        color={useColorModeValue("gray.600", "white")}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.600")}
        w={"full"}
        minH={"80px"}
        boxShadow={"sm"}
        justify={"center"}
        css={{
          backdropFilter: "saturate(180%) blur(5px)",
          backgroundColor: useColorModeValue(
            "rgba(255, 255, 255, 0.8)",
            "rgba(26, 32, 44, 0.8)"
          ),
        }}
      >
        <Container as={Flex} align={"center"} maxW={"6xl"}>
          <Flex>
            <Heading
              textAlign="left"
              fontFamily={"heading"}
              as="h2"
              size="lg"
            >
              <Box
                as={"div"}
                color={useColorModeValue("teal.400", "teal.300")}
                position={"relative"}
                zIndex={10}
                _after={{
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  w: "full",
                  h: "30%",
                  bg: useColorModeValue("teal.100", "teal.900"),
                  zIndex: -1,
                }}
              >
                <NextLink href="/">來點酷提案</NextLink>
              </Box>
            </Heading>
          </Flex>

          <Stack
            flex={{ base: 1 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={4}
            display={{ base: "none", md: "flex" }}
          >
            <Button
              fontSize={"md"}
              fontWeight={600}
              variant={"link"}
              display={{ base: "none", md: "inline-flex" }}
            >
              <NextLink href="/proposal/new">發起酷提案</NextLink>
            </Button>
            <Button
              fontSize={"md"}
              fontWeight={600}
              variant={"link"}
              display={{ base: "none", md: "inline-flex" }}
            >
              <NextLink href="/#howitworks">說明</NextLink>
            </Button>



            {!isSSR && account?.address ?
              (<Menu>
                <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                  {account.address
                    ? account.address.substr(0, 10) + "..."
                    : null}
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={disconnect}>
                    取消連接錢包
                  </MenuItem>
                </MenuList>
              </Menu>)
              :
              (<div>
                <Button
                  fontSize={"md"}
                  fontWeight={600}
                  color={"white"}
                  bg={"teal.400"}
                  href={"#"}
                  mr={"2"}
                  _hover={{
                    bg: "teal.300",
                  }}
                  onClick={() => connect()}
                >
                  連接錢包
                </Button>
              </div>)
            }

            <IconButton
              icon={<InfoOutlineIcon />}
              onClick={() => {
                window.open(gitbook, '_blank', 'noopener,noreferrer');
              }}
            />

            <ModeSwitch />
          </Stack>

          <Flex display={{ base: 'flex', md: 'none' }}>
            <ModeSwitch />
          </Flex>
        </Container>
      </Flex>
    </Box>
  )
}