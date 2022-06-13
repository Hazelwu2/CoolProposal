import {
  Spinner,
  Box,
  Text,
  Flex,
  useColorModeValue
} from "@chakra-ui/react";

import NextLink from "next/link";

export default function Preloader({ txHash }) {
  console.log('txHash', txHash)
  const link = `https://rinkeby.etherscan.io/address/${txHash}`

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
        <Spinner />
        <Text mt={2} fontSize={'lg'} color={'teal.400'}>
          等待交易中...

        </Text>
        <Box>
          {txHash &&
            <a
              target="_blank"
              href={link} />
          }
        </Box>
      </Flex>
    </Box>
  );
}