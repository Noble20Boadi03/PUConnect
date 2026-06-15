import { Request, Response } from 'express';
import prisma from '../config/db';
import { io, userSocketMap } from '../index';

/**
 * Get chat messages between authenticated user and another user
 * @route GET /api/chat/:username
 */
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { username } = req.params;

    // Find the other user
    const otherUser = await prisma.user.findUnique({
      where: { username }
    });
    if (!otherUser) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUser.id },
          { senderId: otherUser.id, receiverId: userId }
        ]
      },
      include: {
        sender: true,
        receiver: true,
        post: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json({
      status: 200,
      data: messages
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
 * Get all conversations for authenticated user
 * @route GET /api/chat
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get all unique users the current user has messaged with
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: { sender: true, receiver: true, post: true },
      orderBy: { createdAt: 'desc' }
    });

    // Group by user
    const conversationMap = new Map();
    for (const msg of messages) {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: msg.senderId === userId ? msg.receiver : msg.sender,
          lastMessage: msg
        });
      }
    }

    const conversations = Array.from(conversationMap.values());
    return res.status(200).json({
      status: 200,
      data: conversations
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
 * Send a chat message
 * @route POST /api/chat
 */
export const sendChatMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const { receiverUsername, content, postId } = req.body;

    // Find receiver
    const receiver = await prisma.user.findUnique({
      where: { username: receiverUsername }
    });
    if (!receiver) {
      return res.status(404).json({
        status: 404,
        message: 'Receiver not found'
      });
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId: receiver.id,
        content,
        postId
      },
      include: { sender: true, receiver: true, post: true }
    });

    // Emit message to receiver via Socket.io if they're online
    const receiverSocketId = userSocketMap.get(receiver.id);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', message);
    }

    // Also emit to sender (for consistency across devices)
    const senderSocketId = userSocketMap.get(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('newMessage', message);
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
      where: { username }
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