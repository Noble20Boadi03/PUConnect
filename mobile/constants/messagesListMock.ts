import type { ConversationPreview } from '../types/chat';

const avatar = (seed: string) => `https://i.pravatar.cc/256?u=${seed}`;

export const MESSAGES_INBOX_MOCK: ConversationPreview[] = [
  {
    id: 'conv-jordanp',
    providerUsername: 'jordanp',
    participant: {
      displayName: 'Jordan P.',
      handle: '@jordanp',
      avatarUrl: avatar('jordanp'),
    },
    contextLine: {
      icon: 'school-outline',
      text: 'Calculus II Weekly Sessions',
    },
    lastMessage: 'Bring your syllabus and any recent homework — we can start with limits review.',
    timestamp: '2:18 PM',
    postId: 'rv-1',
    unread: true,
    unreadCount: 2,
    isOnline: true,
    isPinned: true,
  },
  {
    id: 'conv-mialdesign',
    providerUsername: 'mialdesign',
    participant: {
      displayName: 'Mia L.',
      handle: '@mialdesign',
      avatarUrl: avatar('mialdesign'),
    },
    contextLine: {
      icon: 'color-palette-outline',
      text: 'Club Event Poster Design',
    },
    lastMessage: 'Perfect, I will share the club assets in a bit. Need it before Friday.',
    timestamp: 'Yesterday',
    postId: 'rv-2',
    isOnline: true,
  },
  {
    id: 'conv-christdev',
    providerUsername: 'christdev',
    participant: {
      displayName: 'Chris T.',
      handle: '@christdev',
      avatarUrl: avatar('christdev'),
    },
    contextLine: {
      icon: 'code-slash-outline',
      text: 'Portfolio Website Build',
    },
    lastMessage: 'I can send a quick wireframe tonight if that helps.',
    timestamp: 'Mon',
    postId: 'rv-3',
    unread: true,
    unreadCount: 1,
  },
  {
    id: 'conv-alexkwrites',
    providerUsername: 'alexkwrites',
    participant: {
      displayName: 'Alex K.',
      handle: '@alexkwrites',
      avatarUrl: avatar('alexkwrites'),
    },
    contextLine: {
      icon: 'document-text-outline',
      text: 'Essay editing & proofreading',
    },
    lastMessage: 'Thanks — looking forward to connecting.',
    timestamp: 'Sun',
    postId: '2',
  },
  {
    id: 'conv-priyacodes',
    providerUsername: 'priyacodes',
    participant: {
      displayName: 'Priya N.',
      handle: '@priyacodes',
      avatarUrl: avatar('priyacodes'),
    },
    lastMessage: 'Hi there! Feel free to ask any questions about the bootcamp.',
    timestamp: 'Mar 12',
    isOnline: true,
  },
];
