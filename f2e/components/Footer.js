import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from "@chakra-ui/react";
// Components
import { FaGithub, FaGlobe } from "react-icons/fa";

const SocialButton = ({ children, label, href }) => {
  return (
    <chakra.button
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
      rounded={"full"}
      w={8}
      h={8}
      cursor={"pointer"}
      as={"a"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"background 0.3s ease"}
      _hover={{
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function footer() {
  const website = 'https://kryptocamp.tw/'
  const github = 'https://github.com/Krypto-Camp/batch3-final-project-team-6.git'

  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
    >
      <Container
        as={Stack}
        maxW={"6xl"}
        py={4}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "center" }}
      >
        <Text>Kryptocamp 🌐 第三期第六組</Text>
        <Stack direction={"row"} spacing={6}>
          <SocialButton label={"Website"} href={website}>
            <FaGlobe />
          </SocialButton>
          <SocialButton label={"Github"} href={github}>
            <FaGithub />
          </SocialButton>
        </Stack>
      </Container>
    </Box>
  )
}