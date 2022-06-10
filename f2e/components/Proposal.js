// Utils
import NextLink from "next/link";
import { useState, useEffect } from 'react'
import { utils } from 'ethers'
// UI
import {
  SimpleGrid,
  Box,
  Img,
  Flex,
  Text,
  useColorModeValue,
  Progress,
  Skeleton
} from "@chakra-ui/react";
// API
import { getEthPrice } from '../utils/convert'

function ProposalCard({ name, proposer, id, balance, imageUrl }) {

  return (
    <NextLink href={`/proposal/${id}`}>
      <Box
        bg={useColorModeValue("white", "gray.800")}
        maxW={{ md: "sm" }}
        borderWidth="1px"
        rounded="lg"
        shadow="lg"
        position="relative"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        transition={"transform 0.3s ease"}
        _hover={{
          // transform: "translateX(-12px)",
        }}
      >
        <Box height="18em">
          <Img
            src={imageUrl}
            roundedTop="lg"
            objectFit="cover"
            w="full"
            h="full"
            display="block"
          />
        </Box>
        <Box p="4">
          <Flex
            mt="1"
            justifyContent="space-between"
            alignContent="center"
            py={2}
          >
            <Box
              fontSize="md"
              fontWeight={'300'}
              as="h5"
            >
              {name}
            </Box>
          </Flex>

          <Flex alignContent='center' py={2}>
            <Text fontSize="sm" color={'gray.400'} pr={2}>
              提案 by
            </Text>
            <Text fontSize="sm" color={'blue.300'} pr={2}>
              {proposer ? proposer.substr(0, 18) + '...' : null}
            </Text>
          </Flex>

          <Flex py={2}>
            <Box
              maxW={{ base: "15rem", sm: "sm" }}
              pt="2"
              w="full"
            >
              {/* 目前金額 ETH / USD */}
              <Text
                as="span"
                pr={2}
                fontWeight={"bold"}
                display="inline"
              >
                {balance > 0
                  ? utils.formatEther(balance) + ' ETH'
                  : "0, 成為第一位贊助者"
                }
              </Text>
              <Text
                as="span"
                fontWeight={"300"}
                color={useColorModeValue("gray.500", "gray.200")}
              >
                {/* TODO: 轉換美金 */}
                ($2150.87)
              </Text>

              <Progress
                colorScheme="teal"
                size="sm"
                value={30}
                max={100}
                mt="2"
              />
            </Box>
          </Flex>
        </Box>
      </Box>
    </NextLink>
  )
}

export default function Proposal({ proposalList }) {
  // const [ethPrice, updateEthPrice] = useState(null)

  // 更新 Eth 價格
  // async function getPrice() {
  //   const eth = await getEthPrice()
  //   updateEthPrice(eth)
  // }

  // useEffect(() => {
  //   getPrice()
  // }, [])


  return (
    <div>
      {proposalList?.length > 0 ? (
        <SimpleGrid
          columns={{ base: 1, md: 3 }}
          spacing={10}
          py={8}
          mt={6}
          mb={6}
        >
          {proposalList.map((proposal, index) => {
            return (
              <div key={index}>
                <ProposalCard
                  name={proposal[4]}
                  proposer={proposal[3]}
                  id={index}
                  balance={proposal[1]}
                  imageUrl={proposal[6]}
                />
              </div>
            )
          })}
        </SimpleGrid>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} py={8}>
          <Skeleton height="20rem" />
          <Skeleton height="20rem" />
          <Skeleton height="20rem" />
        </SimpleGrid>
      )}
    </div>
  )
}