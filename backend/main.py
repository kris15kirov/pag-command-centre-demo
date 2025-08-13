from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from dotenv import load_dotenv

from database import get_db, init_db
from models import Message, MessageCategory, MessageSource
from schemas import MessageResponse, MessageUpdate, TemplateResponse
from services.telegram_service import TelegramService
from services.twitter_service import TwitterService
from services.categorization_service import CategorizationService
from config.config import ALLOWED_ORIGINS, AUDITED_PROJECTS

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Comms Command Center API",
    description="API for managing Telegram and Twitter messages for Web3 founders",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
telegram_service = TelegramService()
twitter_service = TwitterService()
categorization_service = CategorizationService()

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Comms Command Center API is running"}

@app.get("/api/messages", response_model=List[MessageResponse])
async def get_messages(
    category: Optional[MessageCategory] = None,
    source: Optional[MessageSource] = None,
    project: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get messages with optional filtering"""
    query = db.query(Message)
    
    if category:
        query = query.filter(Message.category == category)
    if source:
        query = query.filter(Message.source == source)
    if project:
        # Filter messages that mention the specified project
        query = query.filter(Message.content.ilike(f"%{project}%"))
    
    messages = query.order_by(Message.timestamp.desc()).limit(limit).all()
    return messages

@app.post("/api/messages/{message_id}/category")
async def update_message_category(
    message_id: int,
    category_update: MessageUpdate,
    db: Session = Depends(get_db)
):
    """Update message category"""
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.category = category_update.category
    db.commit()
    db.refresh(message)
    
    return {"message": "Category updated successfully", "data": message}

@app.get("/api/templates", response_model=List[TemplateResponse])
async def get_templates():
    """Get Web3-specific reply templates"""
    templates = [
        {
            "id": 1,
            "name": "Audit Request Response",
            "content": "Thanks for your audit request! Pashov Audit Group (trusted by Uniswap and Aave) will review your {project} and respond soon."
        },
        {
            "id": 2,
            "name": "DeFi Protocol Inquiry",
            "content": "Can you share more details about your {project} smart contract? We've audited similar protocols like Sushi and Ethena."
        },
        {
            "id": 3,
            "name": "NFT Project Response",
            "content": "For NFT projects like Sofamon, audited by Pashov Audit Group, please provide your contract address."
        },
        {
            "id": 4,
            "name": "LayerZero Integration",
            "content": "Interested in LayerZero integration? We've audited their cross-chain contracts and can assist."
        },
        {
            "id": 5,
            "name": "DeFi Protocol Details",
            "content": "Please clarify your DeFi protocol requirements. Our audits (e.g., for Karak) ensure top security."
        },
        {
            "id": 6,
            "name": "Quick Response",
            "content": "Thanks for reaching out! I'll get back to you soon."
        },
        {
            "id": 7,
            "name": "Busy Response",
            "content": "I'm currently busy, but I'll address this ASAP."
        }
    ]
    return templates

@app.get("/api/projects")
async def get_audited_projects():
    """Get list of audited projects for filtering"""
    return {"projects": AUDITED_PROJECTS}

@app.get("/api/analytics")
async def get_analytics(db: Session = Depends(get_db)):
    """Get Web3-specific analytics"""
    # Get category counts
    total_messages = db.query(Message).count()
    telegram_count = db.query(Message).filter(Message.source == MessageSource.TELEGRAM).count()
    twitter_count = db.query(Message).filter(Message.source == MessageSource.TWITTER).count()
    
    urgent_count = db.query(Message).filter(Message.category == MessageCategory.URGENT).count()
    high_priority_count = db.query(Message).filter(Message.category == MessageCategory.HIGH_PRIORITY).count()
    routine_count = db.query(Message).filter(Message.category == MessageCategory.ROUTINE).count()
    archive_count = db.query(Message).filter(Message.category == MessageCategory.ARCHIVE).count()
    
    # Get project mentions
    project_counts = {}
    for category, projects in AUDITED_PROJECTS.items():
        for project in projects:
            count = db.query(Message).filter(Message.content.ilike(f"%{project}%")).count()
            if count > 0:
                project_counts[project] = count
    
    # Get recent activity (last 24 hours)
    from datetime import datetime, timedelta
    yesterday = datetime.now() - timedelta(days=1)
    recent_messages = db.query(Message).filter(Message.timestamp >= yesterday).count()
    
    return {
        "overview": {
            "total_messages": total_messages,
            "telegram_messages": telegram_count,
            "twitter_messages": twitter_count,
            "recent_messages_24h": recent_messages
        },
        "categories": {
            "urgent": urgent_count,
            "high_priority": high_priority_count,
            "routine": routine_count,
            "archive": archive_count
        },
        "project_mentions": project_counts,
        "audited_projects": AUDITED_PROJECTS
    }

@app.post("/api/refresh")
async def refresh_messages(db: Session = Depends(get_db)):
    """Fetch new messages from Telegram and Twitter"""
    try:
        # Fetch Telegram messages
        telegram_messages = await telegram_service.fetch_messages()
        telegram_added = 0
        for msg_data in telegram_messages:
            # Check if message already exists
            existing = db.query(Message).filter(Message.external_id == msg_data["id"]).first()
            if not existing:
                category = categorization_service.categorize_message(msg_data["content"])
                message = Message(
                    source=MessageSource.TELEGRAM,
                    sender=msg_data["sender"],
                    content=msg_data["content"],
                    category=category,
                    timestamp=msg_data["timestamp"],
                    external_id=msg_data["id"]
                )
                db.add(message)
                telegram_added += 1
        
        # Fetch Twitter mentions
        twitter_messages = await twitter_service.fetch_mentions()
        twitter_added = 0
        for msg_data in twitter_messages:
            # Check if message already exists
            existing = db.query(Message).filter(Message.external_id == msg_data["id"]).first()
            if not existing:
                category = categorization_service.categorize_message(msg_data["content"])
                message = Message(
                    source=MessageSource.TWITTER,
                    sender=msg_data["sender"],
                    content=msg_data["content"],
                    category=category,
                    timestamp=msg_data["timestamp"],
                    external_id=msg_data["id"]
                )
                db.add(message)
                twitter_added += 1
        
        db.commit()
        return {
            "message": "Messages refreshed successfully", 
            "telegram_count": len(telegram_messages),
            "telegram_added": telegram_added,
            "twitter_count": len(twitter_messages),
            "twitter_added": twitter_added
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error refreshing messages: {str(e)}")

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get message statistics"""
    total_messages = db.query(Message).count()
    telegram_count = db.query(Message).filter(Message.source == MessageSource.TELEGRAM).count()
    twitter_count = db.query(Message).filter(Message.source == MessageSource.TWITTER).count()
    
    urgent_count = db.query(Message).filter(Message.category == MessageCategory.URGENT).count()
    high_priority_count = db.query(Message).filter(Message.category == MessageCategory.HIGH_PRIORITY).count()
    routine_count = db.query(Message).filter(Message.category == MessageCategory.ROUTINE).count()
    archive_count = db.query(Message).filter(Message.category == MessageCategory.ARCHIVE).count()
    
    return {
        "total_messages": total_messages,
        "telegram_messages": telegram_count,
        "twitter_messages": twitter_count,
        "categories": {
            "urgent": urgent_count,
            "high_priority": high_priority_count,
            "routine": routine_count,
            "archive": archive_count
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
