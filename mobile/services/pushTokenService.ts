import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { isDevice } from 'expo-device';
import Constants from 'expo-constants';

export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    if (!isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};
