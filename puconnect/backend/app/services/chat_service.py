"""
Chat Service

Handles business logic for chat/messaging operations.
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.chat import Chat
from app.schemas.chat import ChatCreate, ChatUpdate


class ChatService:
    """Service for managing chat messages."""
    
    @staticmethod
    def create(
        db: Session,
        chat_in: ChatCreate,
        sender_id: UUID
    ) -> Chat:
        """
        Create a new chat message.
        
        Args:
            db: Database session
            chat_in: Chat creation data
            sender_id: ID of the user sending the message
            
        Returns:
            Created Chat object
        """
        db_chat = Chat(
            message=chat_in.message,
            sender_id=sender_id,
            receiver_id=chat_in.receiver_id,
            listing_id=chat_in.listing_id,
            is_read=False
        )
        
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        return db_chat
    
    @staticmethod
    def get(db: Session, chat_id: UUID) -> Optional[Chat]:
        """Get a chat message by ID."""
        return db.query(Chat).filter(Chat.id == chat_id).first()
    
    @staticmethod
    def get_conversation(
        db: Session,
        user1_id: UUID,
        user2_id: UUID,
        listing_id: Optional[UUID] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Chat]:
        """
        Get conversation between two users.
        
        Args:
            db: Database session
            user1_id: First user ID
            user2_id: Second user ID
            listing_id: Optional listing ID to filter by
            skip: Number of messages to skip
            limit: Maximum number of messages to return
            
        Returns:
            List of Chat messages
        """
        query = db.query(Chat).filter(
            or_(
                and_(Chat.sender_id == user1_id, Chat.receiver_id == user2_id),
                and_(Chat.sender_id == user2_id, Chat.receiver_id == user1_id)
            )
        )
        
        if listing_id:
            query = query.filter(Chat.listing_id == listing_id)
        
        return (
            query
            .order_by(Chat.created_at.asc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def get_user_chats(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Chat]:
        """
        Get all chats for a user (sent or received).
        
        Args:
            db: Database session
            user_id: User ID
            skip: Number of messages to skip
            limit: Maximum number of messages to return
            
        Returns:
            List of Chat messages
        """
        return (
            db.query(Chat)
            .filter(
                or_(
                    Chat.sender_id == user_id,
                    Chat.receiver_id == user_id
                )
            )
            .order_by(Chat.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def get_listing_chats(
        db: Session,
        listing_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> List[Chat]:
        """Get all chats related to a specific listing."""
        return (
            db.query(Chat)
            .filter(Chat.listing_id == listing_id)
            .order_by(Chat.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    @staticmethod
    def mark_as_read(
        db: Session,
        chat_id: UUID
    ) -> Optional[Chat]:
        """Mark a chat message as read."""
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            chat.is_read = True
            db.commit()
            db.refresh(chat)
        return chat
    
    @staticmethod
    def mark_conversation_as_read(
        db: Session,
        receiver_id: UUID,
        sender_id: UUID,
        listing_id: Optional[UUID] = None
    ) -> int:
        """
        Mark all messages in a conversation as read.
        
        Args:
            db: Database session
            receiver_id: ID of user receiving messages
            sender_id: ID of user who sent messages
            listing_id: Optional listing ID to filter by
            
        Returns:
            Number of messages marked as read
        """
        query = db.query(Chat).filter(
            Chat.receiver_id == receiver_id,
            Chat.sender_id == sender_id,
            Chat.is_read == False
        )
        
        if listing_id:
            query = query.filter(Chat.listing_id == listing_id)
        
        count = query.update({"is_read": True})
        db.commit()
        return count
    
    @staticmethod
    def get_unread_count(
        db: Session,
        user_id: UUID
    ) -> int:
        """Get count of unread messages for a user."""
        return (
            db.query(Chat)
            .filter(
                Chat.receiver_id == user_id,
                Chat.is_read == False
            )
            .count()
        )
    
    @staticmethod
    def delete(db: Session, chat_id: UUID) -> Optional[Chat]:
        """Delete a chat message."""
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            db.delete(chat)
            db.commit()
        return chat
