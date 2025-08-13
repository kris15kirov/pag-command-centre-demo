import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sqlite3
import os
from datetime import datetime

from main import app
from database import init_db, SessionLocal
from models import Message, MessageCategory, MessageSource

client = TestClient(app)

@pytest.fixture(scope="function")
def setup_database():
    """Setup test database"""
    # Use test database
    test_db_url = "sqlite:///./test_comms.db"
    os.environ["DATABASE_URL"] = test_db_url
    
    # Initialize test database
    init_db()
    
    yield
    
    # Cleanup
    if os.path.exists("./test_comms.db"):
        os.remove("./test_comms.db")

@pytest.mark.asyncio
async def test_health_check():
    """Test health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Comms Command Center API is running"
    assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_get_messages_empty(setup_database):
    """Test getting messages when database is empty"""
    response = client.get("/api/messages")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

@pytest.mark.asyncio
async def test_get_messages_with_data(setup_database):
    """Test getting messages with sample data"""
    # Add test message to database
    db = SessionLocal()
    test_message = Message(
        sender="test_user",
        content="Test message content",
        source=MessageSource.telegram,
        category=MessageCategory.routine,
        timestamp=datetime.now()
    )
    db.add(test_message)
    db.commit()
    db.close()
    
    response = client.get("/api/messages")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["sender"] == "test_user"
    assert data[0]["content"] == "Test message content"

@pytest.mark.asyncio
async def test_get_messages_with_filters(setup_database):
    """Test getting messages with category filter"""
    # Add test messages
    db = SessionLocal()
    urgent_message = Message(
        sender="urgent_user",
        content="Urgent message",
        source=MessageSource.telegram,
        category=MessageCategory.urgent,
        timestamp=datetime.now()
    )
    routine_message = Message(
        sender="routine_user",
        content="Routine message",
        source=MessageSource.twitter,
        category=MessageCategory.routine,
        timestamp=datetime.now()
    )
    db.add(urgent_message)
    db.add(routine_message)
    db.commit()
    db.close()
    
    # Test urgent filter
    response = client.get("/api/messages?category=urgent")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["category"] == "urgent"
    
    # Test source filter
    response = client.get("/api/messages?source=twitter")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["source"] == "twitter"

@pytest.mark.asyncio
async def test_update_message_category(setup_database):
    """Test updating message category"""
    # Add test message
    db = SessionLocal()
    test_message = Message(
        sender="test_user",
        content="Test message",
        source=MessageSource.telegram,
        category=MessageCategory.routine,
        timestamp=datetime.now()
    )
    db.add(test_message)
    db.commit()
    message_id = test_message.id
    db.close()
    
    # Update category
    response = client.post(f"/api/messages/{message_id}/category", json={"category": "urgent"})
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Category updated successfully"
    
    # Verify update
    response = client.get("/api/messages")
    data = response.json()
    updated_message = next(msg for msg in data if msg["id"] == message_id)
    assert updated_message["category"] == "urgent"

@pytest.mark.asyncio
async def test_update_nonexistent_message_category(setup_database):
    """Test updating category for non-existent message"""
    response = client.post("/api/messages/999/category", json={"category": "urgent"})
    assert response.status_code == 404
    data = response.json()
    assert "Message not found" in data["detail"]

@pytest.mark.asyncio
async def test_get_templates():
    """Test getting reply templates"""
    response = client.get("/api/templates")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 5  # We have 5 templates
    
    # Check template structure
    template = data[0]
    assert "id" in template
    assert "name" in template
    assert "content" in template
    assert "Pashov Audit Group" in template["content"]

@pytest.mark.asyncio
async def test_refresh_messages_mock(setup_database):
    """Test refresh messages with mocked services"""
    with patch('services.telegram_service.TelegramService.fetch_messages') as mock_telegram:
        with patch('services.twitter_service.TwitterService.fetch_mentions') as mock_twitter:
            # Mock return values
            mock_telegram.return_value = [
                {
                    "id": "1",
                    "source": "telegram",
                    "sender": "@TestUser",
                    "content": "Test Telegram message",
                    "timestamp": "2025-08-13T10:00:00Z"
                }
            ]
            mock_twitter.return_value = [
                {
                    "id": "2",
                    "source": "twitter",
                    "sender": "@TwitterUser",
                    "content": "Test Twitter message",
                    "timestamp": "2025-08-13T10:05:00Z"
                }
            ]
            
            response = client.post("/api/refresh")
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            assert "Refreshed 2 messages" in data["message"]
            
            # Verify messages were added to database
            response = client.get("/api/messages")
            data = response.json()
            assert len(data) == 2

@pytest.mark.asyncio
async def test_refresh_messages_fallback(setup_database):
    """Test refresh messages with fallback data when services fail"""
    with patch('services.telegram_service.TelegramService.fetch_messages') as mock_telegram:
        with patch('services.twitter_service.TwitterService.fetch_mentions') as mock_twitter:
            # Mock empty returns
            mock_telegram.return_value = []
            mock_twitter.return_value = []
            
            response = client.post("/api/refresh")
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            assert "Refreshed 1 messages" in data["message"]  # Fallback message

@pytest.mark.asyncio
async def test_get_project_feeds_mock():
    """Test getting project feeds with mocked service"""
    with patch('services.twitter_feed_service.fetch_audited_project_feeds') as mock_project_feeds:
        with patch('services.twitter_feed_service.fetch_pashov_audit_group_feed') as mock_pashov:
            # Mock return values
            mock_project_feeds.return_value = {
                "Uniswap": [
                    {
                        "content": "New Uniswap V4 update",
                        "timestamp": "2025-08-13T10:10:00Z"
                    }
                ]
            }
            mock_pashov.return_value = [
                {
                    "content": "Pashov Audit Group completed security review",
                    "timestamp": "2025-08-13T10:15:00Z"
                }
            ]
            
            response = client.get("/api/project-feeds")
            assert response.status_code == 200
            data = response.json()
            assert "Uniswap" in data
            assert "PashovAuditGrp" in data
            assert len(data["Uniswap"]) == 1
            assert len(data["PashovAuditGrp"]) == 1

@pytest.mark.asyncio
async def test_get_project_feeds_fallback():
    """Test getting project feeds with fallback data when service fails"""
    with patch('services.twitter_feed_service.fetch_audited_project_feeds') as mock_project_feeds:
        with patch('services.twitter_feed_service.fetch_pashov_audit_group_feed') as mock_pashov:
            # Mock exceptions
            mock_project_feeds.side_effect = Exception("API Error")
            mock_pashov.side_effect = Exception("API Error")
            
            response = client.get("/api/project-feeds")
            assert response.status_code == 200
            data = response.json()
            assert "PashovAuditGrp" in data
            assert "Fallback" in data["PashovAuditGrp"][0]["content"]

@pytest.mark.asyncio
async def test_refresh_project_feeds_mock():
    """Test refreshing project feeds with mocked service"""
    with patch('services.twitter_feed_service.fetch_audited_project_feeds') as mock_project_feeds:
        with patch('services.twitter_feed_service.fetch_pashov_audit_group_feed') as mock_pashov:
            # Mock return values
            mock_project_feeds.return_value = {
                "Aave": [
                    {
                        "content": "Aave protocol update",
                        "timestamp": "2025-08-13T10:20:00Z"
                    }
                ]
            }
            mock_pashov.return_value = [
                {
                    "content": "Pashov Audit Group news",
                    "timestamp": "2025-08-13T10:25:00Z"
                }
            ]
            
            response = client.post("/api/refresh-feeds")
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            assert "Refreshed feeds for 2 sources" in data["message"]

def test_error_handling():
    """Test error handling for invalid requests"""
    # Test invalid message ID
    response = client.post("/api/messages/invalid/category", json={"category": "urgent"})
    assert response.status_code == 422  # Validation error
    
    # Test invalid category
    response = client.post("/api/messages/1/category", json={"category": "invalid"})
    assert response.status_code == 422  # Validation error

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
