from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean
from sqlalchemy.sql import func
from database import Base
import enum

class MessageCategory(enum.Enum):
    URGENT = "urgent"
    HIGH_PRIORITY = "high_priority"
    ROUTINE = "routine"
    ARCHIVE = "archive"

class MessageSource(enum.Enum):
    TELEGRAM = "telegram"
    TWITTER = "twitter"

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True)  # ID from Telegram/Twitter
    source = Column(Enum(MessageSource), nullable=False)
    sender = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(Enum(MessageCategory), default=MessageCategory.ROUTINE)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
