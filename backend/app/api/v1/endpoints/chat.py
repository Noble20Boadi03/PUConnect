"""
Chat API endpoints.
"""

from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.schemas.chat import ChatCreate, ChatResponse
from app.services.chat_service import ChatService


router = APIRouter()


@router.post("/", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def create_message(
    *,
    db: Session = Depends(deps.get_db),
    chat_in: ChatCreate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Send a new chat message.
    """
    message = ChatService.create(
        db=db,
        chat_in=chat_in,
        sender_id=current_user.id
    )
    return message


@router.get("/conversations/{user_id}", response_model=List[ChatResponse])
def read_conversation(
    *,
    db: Session = Depends(deps.get_db),
    user_id: UUID,
    listing_id: UUID = Query(None, description="Optional listing ID to filter by"),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get conversation between current user and another user.
    """
    messages = ChatService.get_conversation(
        db=db,
        user1_id=current_user.id,
        user2_id=user_id,
        listing_id=listing_id,
        skip=skip,
        limit=limit
    )
    return messages


@router.get("/my-chats", response_model=List[ChatResponse])
def read_my_chats(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get all chats for the current user.
    """
    chats = ChatService.get_user_chats(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    return chats


@router.get("/listing/{listing_id}", response_model=List[ChatResponse])
def read_listing_chats(
    *,
    db: Session = Depends(deps.get_db),
    listing_id: UUID,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get all chats related to a specific listing.
    Only accessible by listing owner.
    """
    # TODO: Verify current_user is the listing owner
    chats = ChatService.get_listing_chats(
        db=db,
        listing_id=listing_id,
        skip=skip,
        limit=limit
    )
    return chats


@router.patch("/{chat_id}/read", response_model=ChatResponse)
def mark_message_as_read(
    *,
    db: Session = Depends(deps.get_db),
    chat_id: UUID,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Mark a message as read.
    Only the receiver can mark a message as read.
    """
    chat = ChatService.get(db=db, chat_id=chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    if chat.receiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to mark this message as read"
        )
    
    chat = ChatService.mark_as_read(db=db, chat_id=chat_id)
    return chat


@router.get("/unread/count")
def get_unread_count(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """
    Get count of unread messages for current user.
    """
    count = ChatService.get_unread_count(db=db, user_id=current_user.id)
    return {"unread_count": count}


@router.delete("/{chat_id}", response_model=ChatResponse)
def delete_message(
    *,
    db: Session = Depends(deps.get_db),
    chat_id: UUID,
    current_user: User = Depends(deps.get_current_user),
):
    """
    Delete a chat message (only by sender or admin).
    """
    chat = ChatService.get(db=db, chat_id=chat_id)
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Only sender or admin can delete
    if chat.sender_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this message"
        )
    
    chat = ChatService.delete(db=db, chat_id=chat_id)
    return chat
