import type { ChatDateGroup } from '../types/chat';

/** Default mock transcript keyed by provider slug. */
export const CHAT_TRANSCRIPT_MOCK: Record<string, ChatDateGroup[]> = {
  jordanp: [
    {
      dateLabel: 'MAY 13',
      messages: [
        {
          id: 'm1',
          kind: 'received',
          text: 'Hey! Thanks for reaching out about the tutoring sessions.',
          time: '9:41 AM',
        },
        {
          id: 'm2',
          kind: 'sent',
          text: 'Hi Jordan — I wanted to ask about availability this week for Calc II.',
          time: '9:43 AM',
        },
        {
          id: 'm3',
          kind: 'received',
          text: 'I have openings Tue and Thu evenings. We can do campus or Zoom.',
          time: '9:45 AM',
        },
      ],
    },
    {
      dateLabel: 'MAY 14',
      messages: [
        {
          id: 'm4',
          kind: 'sent',
          text: 'Thursday evening works for me. What should I bring to the first session?',
          time: '2:10 PM',
        },
        {
          id: 'm5',
          kind: 'received',
          text: 'Bring your syllabus and any recent homework — we can start with limits review.',
          time: '2:18 PM',
        },
      ],
    },
  ],
  mialdesign: [
    {
      dateLabel: 'MAY 12',
      messages: [
        {
          id: 'm1',
          kind: 'received',
          text: 'Hi! Happy to help with your poster — send over any brand colors or logos.',
          time: '11:02 AM',
        },
        {
          id: 'm2',
          kind: 'sent',
          text: 'Perfect, I will share the club assets in a bit. Need it before Friday.',
          time: '11:15 AM',
        },
      ],
    },
  ],
};

export const DEFAULT_CHAT_TRANSCRIPT: ChatDateGroup[] = [
  {
    dateLabel: 'MAY 13',
    messages: [
      {
        id: 'm1',
        kind: 'received',
        text: 'Hi there! Feel free to ask any questions.',
        time: '10:00 AM',
      },
      {
        id: 'm2',
        kind: 'sent',
        text: 'Thanks — looking forward to connecting.',
        time: '10:02 AM',
      },
    ],
  },
];
