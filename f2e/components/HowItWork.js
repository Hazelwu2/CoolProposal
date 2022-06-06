import {
  Container,
  HStack,
  Box,
  Heading,
  SkeletonCircle,
  Divider,
  SimpleGrid,
  Flex,
  Text,
  Stack,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { FcShare, FcDonate, FcMoneyTransfer } from "react-icons/fc";

function Feature({ title, desc, icon }) {
  return (
    <Stack>
      <Flex
        w={16}
        h={16}
        align={"center"}
        justify={"center"}
        color={"white"}
        rounded={"full"}
        bg={useColorModeValue("gray.100", "gray.700")}
        mb={1}
      >
        {icon}
      </Flex>
      <Text fontWeight={600}>{title}</Text>
      <Text color={useColorModeValue("gray.500", "gray.200")}>
        {desc}
      </Text>
    </Stack>
  )
}

export default function HowItWork() {
  return (
    <Container maxW={"6xl"} align={"left"} mt={'16'} id="howitworks">
      <HStack spacing={2}>
        <SkeletonCircle size="4" />
        <Heading as="h2" size="lg">
          使用說明
        </Heading>
      </HStack>
      <Divider marginTop="4" />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} py={10}>
        <Feature
          icon={<Icon as={FcDonate} w={10} h={10} />}
          title={"發起提案"}
          desc='只花費兩分鐘，快速發起提案，把你的夢想寫下，讓更多人看到'
        />
        <Feature
          icon={<Icon as={FcShare} w={10} h={10} />}
          title={"分享你的提案"}
          desc={
            "接下來你要做的就是推廣，將你的提案推廣給朋友們，讓越來越多人知道你的計畫"
          }
        />
        <Feature
          icon={<Icon as={FcMoneyTransfer} w={10} h={10} />}
          title={"提款請求"}
          desc={
            "當超過 50% 捐款者同意提款請求，提案所籌取的資金將會發放到提案者錢包，你可以選擇捲款潛逃或發揚光大"
          }
        />
      </SimpleGrid>
    </Container>
  )
}