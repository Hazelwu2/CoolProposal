import {
  Spinner,
  Box,
  Text,
  Flex,
  Link,
  useColorModeValue
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export default function Preloader({ txHash }) {
  const link = `https://rinkeby.etherscan.io/tx/${txHash}`

  return (
    <Box
      bg={useColorModeValue("white", "gray.700")}
      position={'fixed'}
      t={'0'}
      l={'0'}
      w={'100%'}
      h={'100%'}
    >
      <Flex
        flexDirection={'column'}
        w={'100%'}
        h={'100%'}
        alignItems={'center'}
        justifyContent={'center'}
        bg={'white'}
      >
        <Spinner size="lg" color={useColorModeValue("gray.700", "teal.700")} />
        <Text mt={2} fontSize={'lg'} color={'teal.400'}>
          等待交易中...

        </Text>
        <Box>
          {txHash &&
            <Link
              color="teal.500"
              href={link}
              isExternal
            >
              在 Rinkeby Etherscan 檢視 <ExternalLinkIcon mx="2px" />
            </Link>
          }
        </Box>
      </Flex>
    </Box>
  );
}