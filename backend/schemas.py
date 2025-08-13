from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models import MessageCategory, MessageSource

class MessageBase(BaseModel):
    source: MessageSource
    sender: str
    content: str
    category: MessageCategory = MessageCategory.ROUTINE

class MessageResponse(MessageBase):
    id: int
    external_id: Optional[str] = None
    timestamp: datetime
    is_read: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MessageUpdate(BaseModel):
    category: MessageCategory

class TemplateResponse(BaseModel):
    id: int
    name: str
    content: str

class StatsResponse(BaseModel):
    total_messages: int
    telegram_messages: int
    twitter_messages: int
    categories: dict
