// Chakra UI
import {
  Heading,
  Button,
  useColorModeValue,
  useBreakpointValue,
  Container,
  Flex,
  Box,
  Stack,
  HStack,
  Avatar,
  Text,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";

function TeamCard({ name, image, desc }) {
  return (
    <Box
      bg={useColorModeValue("white", "gray.800")}
      rounded="md"
      shadow="md"
      borderWidth="1px"
      py={2}
      px={4}
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      filter='grayscale(0%)'
      transition={"all 0.45s cubic-bezier(0.64, 0.01, 0.07, 1.65)"}
      _hover={{
        transform: "translate(5px)",
        filter: "grayscale(100%)"
      }}
    >


      <Flex flexDirection={'row'}>
        <Avatar
          size='lg'
          name='Christian Nwamba'
          shadow="md"
          src={image}
          mr={4}
          mt={2}
          mb={2}
        />

        <Flex flexDirection={'column'} alignItems={'flex-start'} justifyContent={'center'}>
          <Box>
            <Text color={'gray.700'} fontSize={'2xl'} fontWeight={'bold'}>
              {name}
            </Text>
            <Text fontSize='sm' color={'gray.400'} whiteSpace={'pre-line'}>
              {desc}
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}

export default function Team() {
  const members = [
    { name: 'Hazel', desc: 'Team Leader & Project Manager \n Front-End Developer', image: '/static/Hazel.png' },
    { name: 'Allen', desc: 'Smart Contract Developer', image: '/static/Allen.jpg' },
    { name: 'Jimbo', desc: 'Front-End Developer', image: '/static/Jimbo.jpg' },
    { name: 'Jim', desc: 'Whitepaper Writer', image: '/static/Jim.jpg' },
  ]

  return (
    <Container maxW={"6xl"} align={"left"} mt={'16'} id="team">
      <HStack spacing={2}>
        <Heading as="h2" size="lg">
          Team Member
        </Heading>
      </HStack>
      <Divider marginTop="4" />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} py={5}>
        {
          members.length > 0 && members.map((member, index) => {
            return (
              <TeamCard
                key={index}
                name={member.name}
                image={member.image}
                desc={member.desc}
              />
            )
          })
        }
      </SimpleGrid>
    </Container>
  )
}