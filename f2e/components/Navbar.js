import {
  Box,
  Flex,
  Container,
  Heading,
  Stack,
  Button,
  useColorModeValue
} from '@chakra-ui/react'
import NextLink from 'next/link'
// Component
import ModeSwitch from './ModeSwitch'

export default function Navbar() {
  return (
    <Box>
      <Flex
        color={useColorModeValue("gray.600", "white")}
        py={{ base: 2 }}
        px={{ base: 4 }}
        w={"full"}
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
        <Container as={Flex} align={"center"}>
          <Flex flex={{ base: 1 }}>
            <Heading
              textAlign="left"
              fontFamily={"heading"}
              as="h2"
              size="lg"
            >
              <Box
                as={"span"}
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
                <NextLink href="/">眾籌平台</NextLink>
              </Box>
            </Heading>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={6}
            display={{ base: "none", md: "flex" }}
          >
            <Button
              fontSize={"md"}
              fontWeight={600}
              variant={"link"}
              display={{ base: "none", md: "inline-flex" }}
            >
              <NextLink href="/campaign/new">提案</NextLink>
            </Button>
            <Button
              fontSize={"md"}
              fontWeight={600}
              variant={"link"}
              display={{ base: "none", md: "inline-flex" }}
            >
              <NextLink href="/#howitworks">說明</NextLink>
            </Button>

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
            >
              連接錢包
            </Button>
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