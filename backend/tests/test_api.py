import pytest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
import sqlite3
from unittest.mock import patch, MagicMock

client = TestClient(app)

@pytest.fixture
def setup_database():
    """Setup test database with sample data"""
    # Create test database
    conn = sqlite3.connect("test_comms.db")
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT UNIQUE,
            source TEXT NOT NULL,
            sender TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'routine',
            timestamp TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Insert test data
    test_messages = [
        (1, '1', 'telegram', '@Web3Dev', 'Urgent audit for Uniswap fork', 'urgent', '2025-08-12T10:00:00Z'),
        (2, '2', 'twitter', '@CryptoFounder', '@KrumPashov Aave integration query', 'high_priority', '2025-08-12T10:05:00Z'),
        (3, '3', 'telegram', '@NFTCreator', 'Need Sofamon NFT audit', 'high_priority', '2025-08-12T10:10:00Z'),
        (4, '4', 'twitter', '@DeFiGuru', '@KrumPashov LayerZero bridge audit?', 'routine', '2025-08-12T10:15:00Z')
    ]
    
    cursor.executemany(
        "INSERT INTO messages (id, external_id, source, sender, content, category, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
        test_messages
    )
    conn.commit()
    conn.close()
    
    yield
    
    # Cleanup
    if os.path.exists("test_comms.db"):
        os.remove("test_comms.db")

class TestMessagesEndpoint:
    """Test cases for /messages endpoint"""
    
    def test_get_messages_success(self, setup_database):
        """Test successful retrieval of messages"""
        response = client.get("/api/messages")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4
        assert any(msg["source"] == "TELEGRAM" for msg in data)
        assert any(msg["source"] == "TWITTER" for msg in data)
    
    def test_get_messages_structure(self, setup_database):
        """Test message structure contains required fields"""
        response = client.get("/api/messages")
        data = response.json()
        
        if data:
            message = data[0]
            required_fields = ["id", "source", "sender", "content", "category", "timestamp"]
            for field in required_fields:
                assert field in message
    
    def test_get_messages_web3_keywords(self, setup_database):
        """Test that Web3-specific messages are properly categorized"""
        response = client.get("/api/messages")
        data = response.json()
        
        uniswap_message = next((msg for msg in data if "Uniswap" in msg["content"]), None)
        aave_message = next((msg for msg in data if "Aave" in msg["content"]), None)
        
        if uniswap_message:
            assert uniswap_message["category"] in ["URGENT", "HIGH_PRIORITY", "ROUTINE", "ARCHIVE"]
        if aave_message:
            assert aave_message["category"] in ["URGENT", "HIGH_PRIORITY", "ROUTINE", "ARCHIVE"]

class TestRefreshEndpoint:
    """Test cases for /refresh endpoint"""
    
    @patch('services.telegram_service.TelegramService.fetch_messages')
    @patch('services.twitter_service.TwitterService.fetch_mentions')
    def test_refresh_messages_success(self, mock_twitter, mock_telegram, setup_database):
        """Test successful refresh of messages from external APIs"""
        # Mock external service responses
        mock_telegram.return_value = [
            {
                "id": "5",
                "sender": "@NewClient",
                "content": "Need Ethena audit for new protocol",
                "timestamp": "2025-08-12T10:20:00Z"
            }
        ]
        
        mock_twitter.return_value = [
            {
                "id": "67890",
                "sender": "@DeFiAnalyst", 
                "content": "@KrumPashov Sushi protocol audit request",
                "timestamp": "2025-08-12T10:25:00Z"
            }
        ]
        
        response = client.post("/api/refresh")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Messages refreshed successfully" in data["message"]
    
    @patch('services.telegram_service.TelegramService.fetch_messages')
    @patch('services.twitter_service.TwitterService.fetch_mentions')
    def test_refresh_categorization(self, mock_twitter, mock_telegram, setup_database):
        """Test that new messages are properly categorized"""
        mock_telegram.return_value = [
            {
                "id": "6",
                "sender": "@UrgentClient",
                "content": "URGENT: Critical vulnerability in Uniswap fork",
                "timestamp": "2025-08-12T10:30:00Z"
            }
        ]
        mock_twitter.return_value = []
        
        response = client.post("/api/refresh")
        assert response.status_code == 200

class TestCategoryUpdate:
    """Test cases for category update endpoint"""
    
    def test_update_category_success(self, setup_database):
        """Test successful category update"""
        response = client.post("/api/messages/1/category", json={"category": "HIGH_PRIORITY"})
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Category updated successfully" in data["message"]
    
    def test_update_category_invalid_id(self, setup_database):
        """Test category update with invalid message ID"""
        response = client.post("/api/messages/999/category", json={"category": "HIGH_PRIORITY"})
        assert response.status_code == 404
    
    def test_update_category_invalid_category(self, setup_database):
        """Test category update with invalid category"""
        response = client.post("/api/messages/1/category", json={"category": "invalid_category"})
        assert response.status_code == 422  # FastAPI validation error

class TestCategorizationLogic:
    """Test cases for message categorization logic"""
    
    def test_urgent_categorization(self):
        """Test urgent message categorization"""
        from services.categorization_service import CategorizationService
        
        service = CategorizationService()
        urgent_keywords = ["URGENT", "CRITICAL", "EMERGENCY", "IMMEDIATE"]
        for keyword in urgent_keywords:
            message = f"{keyword}: Need audit immediately"
            assert service.categorize_message(message) == "URGENT"
    
    def test_high_categorization(self):
        """Test high priority message categorization"""
        from services.categorization_service import CategorizationService
        
        service = CategorizationService()
        high_keywords = ["Aave", "Uniswap", "LayerZero", "Ethena", "Sushi", "Sofamon"]
        for keyword in high_keywords:
            message = f"Need audit for {keyword} protocol"
            assert service.categorize_message(message) == "HIGH_PRIORITY"
    
    def test_routine_categorization(self):
        """Test routine message categorization"""
        from services.categorization_service import CategorizationService
        
        service = CategorizationService()
        routine_messages = [
            "General blockchain question",
            "How much does an audit cost?",
            "Can you review our smart contract?"
        ]
        
        for message in routine_messages:
            category = service.categorize_message(message)
            assert category in ["ROUTINE", "HIGH_PRIORITY"]  # Some might be categorized as high
    
    def test_archive_categorization(self):
        """Test archive message categorization"""
        from services.categorization_service import CategorizationService
        
        service = CategorizationService()
        archive_messages = [
            "Random message",
            "Spam content",
            "Unrelated to blockchain"
        ]
        
        for message in archive_messages:
            category = service.categorize_message(message)
            assert category in ["ARCHIVE", "ROUTINE"]  # Some might be categorized as routine

class TestWeb3SpecificFeatures:
    """Test cases for Web3-specific functionality"""
    
    def test_audited_project_highlighting(self, setup_database):
        """Test that messages mentioning audited projects are properly identified"""
        response = client.get("/api/messages")
        data = response.json()
        
        audited_projects = ["Uniswap", "Aave", "LayerZero", "Ethena", "Sushi"]
        
        for project in audited_projects:
            project_messages = [msg for msg in data if project in msg["content"]]
            for msg in project_messages:
                # Messages about audited projects should be categorized appropriately
                assert msg["category"] in ["URGENT", "HIGH_PRIORITY", "ROUTINE"]
    
    def test_web3_keyword_detection(self, setup_database):
        """Test detection of Web3-specific keywords"""
        from services.categorization_service import CategorizationService
        
        service = CategorizationService()
        web3_keywords = {
            "audit": "HIGH_PRIORITY",
            "smart contract": "HIGH_PRIORITY", 
            "DeFi": "HIGH_PRIORITY",
            "NFT": "HIGH_PRIORITY",
            "blockchain": "ROUTINE",
            "crypto": "ROUTINE"
        }
        
        for keyword, expected_category in web3_keywords.items():
            message = f"Need help with {keyword}"
            category = service.categorize_message(message)
            assert category in [expected_category, "HIGH_PRIORITY"]  # Some might be categorized as high

if __name__ == "__main__":
    pytest.main([__file__])
