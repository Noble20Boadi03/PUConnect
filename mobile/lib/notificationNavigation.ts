import { useRouter } from 'expo-router';
import type { AppNotification, NotificationKind } from '../constants/notificationsMock';

export const handleNotificationNavigation = (
  notification: AppNotification | { data?: any; kind?: string },
  router: ReturnType<typeof useRouter>
) => {
  const data = notification.data || {};
  const kind = (notification.kind || data.type) as NotificationKind | string;

  switch (kind) {
    case 'message':
      if (data.username) {
        router.push(`/chat/${data.username}` as any);
      }
      break;
    case 'request':
    case 'service':
      if (data.serviceRequestId) {
        router.push(`/service-request/${data.serviceRequestId}` as any);
      }
      break;
    case 'review':
      router.push('/profile' as any);
      break;
    case 'system':
      // Do nothing, stay on notifications
      break;
    default:
      // Unknown type, do nothing
      break;
  }
};

export const getNotificationActionLabel = (notification: AppNotification): string => {
  const data = notification.data || {};
  const kind = notification.kind || data.type;

  switch (kind) {
    case 'message':
      return 'Go to Chat';
    case 'request':
    case 'service':
      return 'View Request';
    case 'review':
      return 'View Profile';
    case 'system':
    default:
      return 'Dismiss';
  }
};
