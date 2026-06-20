import { useChatStore } from '../store/chatStore';
import type { ChatState } from '../store/chatStore';

export function useChat<T = ChatState>(selector?: (state: ChatState) => T): T {
  return useChatStore(selector ?? ((s) => s as unknown as T));
}

export default useChat;
