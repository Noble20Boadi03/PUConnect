import { Request, Response } from 'express';
import prisma from '../config/db';
import { io } from '../index';
import { notifyUser } from './serviceRequestController';

const safeUserSelect = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  role: true,
  categoryId: true,
  skillTitle: true,
  expertiseTags: true,
  serviceIds: true,
  createdAt: true,
  updatedAt: true
};

const postSelect = { 
  id: true, 
  title: true, 
  description: true, 
  tag: true, 
  price: true, 
  images: true, 
  hashtags: true, 
  helpCategoryIds: true, 
  authorId: true, 
  createdAt: true, 
  updatedAt: true 
};

export async function sendSystemMessage(
  senderId: string,
  receiverId: string,
  senderContent: string,
  receiverContent: string,
  postId?: string
) {
  // Create message for sender
  const senderMessage = await prisma.chatMessage.create({
    data: {
      senderId,
      receiverId,
      content: senderContent,
      postId,
      kind: 'system'
    },
    include: {
      sender: { select: safeUserSelect },
      receiver: { select: safeUserSelect },
      post: { select: postSelect }
    }
  });

  // Create message for receiver
  const receiverMessage = await prisma.chatMessage.create({
    data: {
      senderId: receiverId,
      receiverId: senderId,
      content: receiverContent,
      postId,
      kind: 'system'
    },
    include: {
      sender: { select: safeUserSelect },
      receiver: { select: safeUserSelect },
      post: { select: postSelect }
    }
  });

  // Emit to correct parties
  io.to(senderId).emit('newMessage', senderMessage);
  io.to(receiverId).emit('newMessage', receiverMessage);

  return { senderMessage, receiverMessage };
}

/**
 * Delete a chat message
 * @route DELETE /api/chat/message/:messageId
 */
export const deleteChatMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { messageId } = req.params;

    // Find the message
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: { sender: true, receiver: true }
    });

    if (!message) {
      return res.status(404).json({
        status: 404,
        message: 'Message not found'
      });
    }

    // Check if the user is the sender
    if (message.senderId !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'You can only delete your own messages'
      });
    }

    // Delete the message
    await prisma.chatMessage.delete({
      where: { id: messageId }
    });

    // Emit socket event to both sender and receiver
    const threadId = [message.senderId, message.receiverId].sort().join('-');
    io.to(message.senderId).emit('messageDeleted', { messageId, threadId });
    io.to(message.receiverId).emit('messageDeleted', { messageId, threadId });

    return res.status(200).json({
      status: 200,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('DeleteChatMessage error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Get chat messages between authenticated user and another user (cursor-based pagination)
 * @route GET /api/chat/:username
 */
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username } = req.params;
    const { cursor, limit = 30 } = req.query;

    // Find the other user
    const otherUser = await prisma.user.findUnique({
      where: { username },
      select: safeUserSelect
    });
    if (!otherUser) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    // Get one extra message to check if there are more
    const takeLimit = parseInt(limit as string, 10) + 1;

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUser.id },
          { senderId: otherUser.id, receiverId: userId }
        ]
      },
      include: {
        sender: { select: safeUserSelect },
        receiver: { select: safeUserSelect },
        post: { select: postSelect }
      },
      orderBy: { createdAt: 'desc' },
      take: takeLimit,
      cursor: cursor ? { id: cursor as string } : undefined,
      skip: cursor ? 1 : 0
    });

    // Check if there are more messages
    const hasMore = messages.length === takeLimit;
    // Remove the extra message if it exists
    const paginatedMessages = hasMore ? messages.slice(0, -1) : messages;
    // Get next cursor from the oldest message in the paginated list
    const nextCursor = paginatedMessages.length > 0 ? paginatedMessages[paginatedMessages.length - 1].id : null;

    // Reverse to get ascending order
    const sortedMessages = paginatedMessages.reverse();

    return res.status(200).json({
      status: 200,
      data: sortedMessages,
      nextCursor,
      hasMore
    });
  } catch (error) {
    console.error('GetChatMessages error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Get all conversations for authenticated user (page-based pagination)
 * @route GET /api/chat
 */
export const getConversations = async (req: Request, res: Response) => {
  console.log('[TIMESTAMP] getConversations start:', new Date().toISOString());
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    console.log('[TIMESTAMP] getConversations before mutedConversations:', new Date().toISOString());
    // First get all muted conversations for user
    const mutedConversations = await prisma.mutedConversation.findMany({
      where: { userId },
      select: { participantUsername: true }
    });
    const mutedUsernames = new Set(mutedConversations.map(mc => mc.participantUsername));

    console.log('[TIMESTAMP] getConversations before allLastMessages:', new Date().toISOString());
    // First get all unique user IDs and last messages with proper ordering
    const allLastMessages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: { 
        sender: { select: safeUserSelect }, 
        receiver: { select: safeUserSelect }, 
        post: { select: postSelect } 
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['senderId', 'receiverId']
    });

    console.log('[TIMESTAMP] getConversations after allLastMessages, before grouping:', new Date().toISOString());
    // Group by user and add isMuted
    const conversationMap = new Map();
    for (const msg of allLastMessages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: otherUser,
          lastMessage: msg,
          isMuted: mutedUsernames.has(otherUser.username)
        });
      }
    }

    const allConversations = Array.from(conversationMap.values());
    const total = allConversations.length;
    const paginatedConversations = allConversations.slice(skip, skip + limitNumber);
    const hasMore = skip + limitNumber < total;

    console.log('[TIMESTAMP] getConversations before sending response:', new Date().toISOString());
    return res.status(200).json({
      status: 200,
      data: paginatedConversations,
      total,
      page: pageNumber,
      hasMore
    });
  } catch (error) {
    console.error('GetConversations error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Mute a conversation
 * @route POST /api/chat/:username/mute
 */
export const muteConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username } = req.params;

    // Check if user exists
    const participant = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true }
    });
    if (!participant) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    // Create or upsert muted conversation
    await prisma.mutedConversation.upsert({
      where: {
        userId_participantUsername: {
          userId,
          participantUsername: username
        }
      },
      create: {
        userId,
        participantUsername: username
      },
      update: {}
    });

    return res.status(200).json({
      status: 200,
      message: 'Conversation muted'
    });
  } catch (error) {
    console.error('MuteConversation error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Unmute a conversation
 * @route DELETE /api/chat/:username/mute
 */
export const unmuteConversation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username } = req.params;

    // Delete muted conversation
    await prisma.mutedConversation.deleteMany({
      where: {
        userId,
        participantUsername: username
      }
    });

    return res.status(200).json({
      status: 200,
      message: 'Conversation unmuted'
    });
  } catch (error) {
    console.error('UnmuteConversation error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Send a chat message
 * @route POST /api/chat
 */
export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { receiverUsername, content, postId } = req.body;

    // Find receiver
    const receiver = await prisma.user.findUnique({
      where: { username: receiverUsername },
      select: safeUserSelect
    });
    if (!receiver) {
      return res.status(404).json({
        status: 404,
        message: 'Receiver not found'
      });
    }

    // Get sender's username to check if receiver has muted the conversation
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { username: true }
    });

    const message = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId: receiver.id,
        content,
        postId
      },
      include: { 
        sender: { select: safeUserSelect }, 
        receiver: { select: safeUserSelect }, 
        post: { select: postSelect } 
      },
    });

    // Emit message to receiver via Socket.io if they're online
    io.to(receiver.id).emit('newMessage', message);

    // Also emit to sender (for consistency across devices)
    io.to(senderId).emit('newMessage', message);
    
    // Check if receiver has muted the conversation with sender before sending notification
    if (sender) {
      const isMuted = await prisma.mutedConversation.findFirst({
        where: {
          userId: receiver.id,
          participantUsername: sender.username
        }
      });

      if (!isMuted) {
        // Create DB notification and send push
        await notifyUser(
          receiver.id,
          'message',
          message.sender.name || message.sender.username,
          message.content.length > 100 ? message.content.substring(0, 100) + '...' : message.content,
          message.sender.username,
          `/chat/${message.sender.username}`,
          { type: 'message', username: message.sender.username }
        );
      }
    }

    return res.status(201).json({
      status: 201,
      message: 'Message sent',
      data: message
    });
  } catch (error) {
    console.error('SendChatMessage error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Mark messages as read
 * @route PUT /api/chat/:username/read
 */
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username } = req.params;

    const otherUser = await prisma.user.findUnique({
      where: { username },
      select: safeUserSelect
    });
    if (!otherUser) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    await prisma.chatMessage.updateMany({
      where: {
        senderId: otherUser.id,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return res.status(200).json({
      status: 200,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('MarkMessagesAsRead error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};

/**
 * Get unread messages count for authenticated user
 * @route GET /api/chat/unread-count
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const unreadCount = await prisma.chatMessage.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
    return res.status(200).json({
      status: 200,
      data: { count: unreadCount }
    });
  } catch (error) {
    console.error('GetUnreadCount error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Server error'
    });
  }
};