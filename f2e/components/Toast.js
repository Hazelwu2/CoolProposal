import { useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";

// status type: "info" | "warning" | "success" | "error" | "loading"
export function useToastHook() {
  const [state, setState] = useState(undefined);
  const toast = useToast();

  useEffect(() => {
    if (state) {
      const { message, status } = state;

      toast({
        description: message,
        status: status,
        duration: 5000,
        position: "top-right",
        isClosable: true,
      });
    }
  }, [state, toast]);

  return [state, setState];
}