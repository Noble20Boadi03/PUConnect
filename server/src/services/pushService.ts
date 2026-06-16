import { Expo, ExpoPushMessage, ExpoPushTicket, ExpoPushErrorReceipt } from 'expo-server-sdk';
import prisma from '../config/db';

const expo = new Expo();

export const sendPushNotification = async (
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> => {
  try {
    // Validate the push token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.warn(`Invalid Expo push token: ${pushToken}`);
      return;
    }

    // Create the message
    const message: ExpoPushMessage = {
      to: pushToken,
      title,
      body,
      data,
      sound: 'default',
    };

    // Send the notification
    const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync([message]);

    // Handle the ticket
    const ticket = tickets[0];
    if (ticket.status === 'error') {
      console.error('Push notification error:', ticket.message, ticket.details);
      
      // If the error indicates an invalid token, clear it from the database
      if (
        ticket.details?.error === 'DeviceNotRegistered' ||
        ticket.details?.error === 'InvalidCredentials'
      ) {
        // Find user by push token and clear it
        await prisma.user.updateMany({
          where: { pushToken },
          data: { pushToken: null },
        });
        console.log(`Cleared invalid push token: ${pushToken}`);
      }
    }
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
};
