import { useColorMode, IconButton } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export default function ModeSwitch() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <IconButton
      icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
      onClick={toggleColorMode}
    />
  )
}