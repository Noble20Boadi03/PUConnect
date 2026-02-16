import logging
from typing import Dict
from uuid import UUID
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.chat import ChatMessage

logger = logging.getLogger("websocket")

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[UUID, WebSocket] = {}

    async def connect(self, user_id: UUID, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected.")

    async def disconnect(self, user_id: UUID):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected.")

    async def send_personal_message(self, receiver_id: UUID, message: dict):
        websocket = self.active_connections.get(receiver_id)
        if websocket:
            try:
                await websocket.send_json(message)
                logger.info(f"Message sent to user {receiver_id}.")
            except Exception as e:
                logger.error(f"Failed to send message to user {receiver_id}: {e}")
        else:
            logger.warning(f"User {receiver_id} is not connected. Message not sent.")

    async def broadcast(self, message: dict):
        # TODO: Replace with Redis Pub/Sub for scalability
        for user_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
                logger.info(f"Broadcast message sent to user {user_id}.")
            except Exception as e:
                logger.error(f"Failed to broadcast message to user {user_id}: {e}")

    async def save_message(self, db: Session, sender_id: UUID, receiver_id: UUID, listing_id: UUID, message: str):
        chat_message = ChatMessage(
            sender_id=sender_id,
            receiver_id=receiver_id,
            listing_id=listing_id,
            message=message,
            timestamp=datetime.utcnow()
        )
        db.add(chat_message)
        db.commit()
        db.refresh(chat_message)
        logger.info(f"Message saved to database: {chat_message}")
        return chat_message

async def handle_chat(websocket: WebSocket, user_id: UUID, db: Session):
    manager = WebSocketManager()
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            required_fields = {"receiver_id", "listing_id", "message"}
            if not required_fields.issubset(data):
                logger.warning("Invalid message format received.")
                continue

            receiver_id = UUID(data["receiver_id"])
            listing_id = UUID(data["listing_id"])
            message = data["message"]

            saved_message = await manager.save_message(db, user_id, receiver_id, listing_id, message)

            await manager.send_personal_message(receiver_id, {
                "sender_id": str(saved_message.sender_id),
                "receiver_id": str(saved_message.receiver_id),
                "listing_id": str(saved_message.listing_id),
                "message": saved_message.message,
                "timestamp": saved_message.timestamp.isoformat()
            })
    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected.")
        await manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"Error in handle_chat: {e}")