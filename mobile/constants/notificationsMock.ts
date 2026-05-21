export type NotificationKind = 'message' | 'service' | 'request' | 'system';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const NOTIFICATIONS_MOCK: AppNotification[] = [
  {
    id: 'n1',
    kind: 'message',
    title: 'New message from Jordan P.',
    body: 'Bring your syllabus and any recent homework — we can start with limits review.',
    time: '2h ago',
    read: false,
  },
  {
    id: 'n2',
    kind: 'service',
    title: 'Service request update',
    body: 'Mia L. replied about your Club Event Poster Design inquiry.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 'n3',
    kind: 'request',
    title: 'Someone responded to your request',
    body: 'Chris T. sent a message about the campus marketplace MVP.',
    time: 'Mon',
    read: false,
  },
  {
    id: 'n4',
    kind: 'system',
    title: 'Welcome to PuConnect',
    body: 'Complete your profile to get more responses on the market.',
    time: 'Mar 10',
    read: true,
  },
];
