// UI chakra
import {
  Text,
  Button,
  Flex,
  Container,
  SimpleGrid,
  Box,
  Spacer,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
} from "@chakra-ui/icons";
// Next
import NextLink from "next/link";

export default function BreadcrumbBackLink({ link }) {
  return (
    <Container px={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
      <Flex flexDirection={{ base: "column", md: "row" }} py={4}>
        <Box py="4">
          <Text fontSize={"lg"} color={"teal.400"}>
            <ArrowBackIcon mr={2} />
            <NextLink href={link}>
              回到上一頁
            </NextLink>
          </Text>
          <Spacer />
        </Box>
      </Flex>
    </Container>
  )
}