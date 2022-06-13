import { useToast } from "@chakra-ui/react";
import { useState, useEffect } from "react";
/*
  使用方式
  1. 引入
  import { useToastHook } from '/components/Toast'

  2. 設定
  const [state, newToast] = useToastHook();

  3. 呼叫
  newToast({ message: '感謝贊助 🙏', status: "success" });

  status type:
  "info" | "warning" | "success" | "error" | "loading"
*/

export function useToastHook() {
  const [state, setState] = useState(undefined);
  const toast = useToast();

  useEffect(() => {
    if (state) {
      const { message, status, isClosable } = state;
      const params = {
        description: message,
        status: status,
        duration: 5000,
        position: "top",
        isClosable: isClosable || true,
      }

      toast(params);
    }
  }, [state, toast]);

  return [state, setState];
}