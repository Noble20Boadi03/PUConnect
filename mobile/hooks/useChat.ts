import { useChatStore } from '../store/chatStore';
import type { ChatState } from '../store/chatStore';
import { useShallow } from 'zustand/react/shallow';

export function useChat<T = ChatState>(selector?: (state: ChatState) => T): T {
  if (selector) {
    return useChatStore(selector);
  }
  return useChatStore(useShallow((s) => s as unknown as T));
}

export default useChat;
