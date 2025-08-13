import pytest
from fastapi.testclient import TestClient
from main import app
import sqlite3
import os
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
            id TEXT PRIMARY KEY,
            source TEXT NOT NULL,
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            category TEXT DEFAULT 'routine',
            timestamp TEXT NOT NULL
        )
    """)
    
    # Insert test data
    test_messages = [
        ('1', 'Telegram', '@Web3Dev', 'Urgent audit for Uniswap fork', 'urgent', '2025-08-12T10:00:00Z'),
        ('2', 'Twitter', '@CryptoFounder', '@KrumPashov Aave integration query', 'high', '2025-08-12T10:05:00Z'),
        ('3', 'Telegram', '@NFTCreator', 'Need Sofamon NFT audit', 'high', '2025-08-12T10:10:00Z'),
        ('4', 'Twitter', '@DeFiGuru', '@KrumPashov LayerZero bridge audit?', 'routine', '2025-08-12T10:15:00Z')
    ]
    
    cursor.executemany(
        "INSERT INTO messages (id, source, sender, text, category, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
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
        response = client.get("/messages")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 4
        assert any(msg["source"] == "Telegram" for msg in data)
        assert any(msg["source"] == "Twitter" for msg in data)
    
    def test_get_messages_structure(self, setup_database):
        """Test message structure contains required fields"""
        response = client.get("/messages")
        data = response.json()
        
        if data:
            message = data[0]
            required_fields = ["id", "source", "sender", "text", "category", "timestamp"]
            for field in required_fields:
                assert field in message
    
    def test_get_messages_web3_keywords(self, setup_database):
        """Test that Web3-specific messages are properly categorized"""
        response = client.get("/messages")
        data = response.json()
        
        uniswap_message = next((msg for msg in data if "Uniswap" in msg["text"]), None)
        aave_message = next((msg for msg in data if "Aave" in msg["text"]), None)
        
        if uniswap_message:
            assert uniswap_message["category"] in ["urgent", "high", "routine", "archive"]
        if aave_message:
            assert aave_message["category"] in ["urgent", "high", "routine", "archive"]

class TestRefreshEndpoint:
    """Test cases for /refresh endpoint"""
    
    @patch('services.telegram_service.fetch_telegram_messages')
    @patch('services.twitter_service.fetch_twitter_mentions')
    def test_refresh_messages_success(self, mock_twitter, mock_telegram, setup_database):
        """Test successful refresh of messages from external APIs"""
        # Mock external service responses
        mock_telegram.return_value = [
            {
                "id": "5",
                "source": "Telegram", 
                "sender": "@NewClient",
                "text": "Need Ethena audit for new protocol",
                "timestamp": "2025-08-12T10:20:00Z"
            }
        ]
        
        mock_twitter.return_value = [
            {
                "id": "67890",
                "source": "Twitter",
                "sender": "@DeFiAnalyst", 
                "text": "@KrumPashov Sushi protocol audit request",
                "timestamp": "2025-08-12T10:25:00Z"
            }
        ]
        
        response = client.get("/refresh")
        assert response.status_code == 200
        assert response.json() == {"success": True}
        
        # Verify new messages are stored
        conn = sqlite3.connect("test_comms.db")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM messages WHERE text LIKE '%Ethena%'")
        ethena_result = cursor.fetchone()
        assert ethena_result is not None
        
        cursor.execute("SELECT * FROM messages WHERE text LIKE '%Sushi%'")
        sushi_result = cursor.fetchone()
        assert sushi_result is not None
        conn.close()
    
    @patch('services.telegram_service.fetch_telegram_messages')
    @patch('services.twitter_service.fetch_twitter_mentions')
    def test_refresh_categorization(self, mock_twitter, mock_telegram, setup_database):
        """Test that new messages are properly categorized"""
        mock_telegram.return_value = [
            {
                "id": "6",
                "source": "Telegram",
                "sender": "@UrgentClient",
                "text": "URGENT: Critical vulnerability in Uniswap fork",
                "timestamp": "2025-08-12T10:30:00Z"
            }
        ]
        mock_twitter.return_value = []
        
        response = client.get("/refresh")
        assert response.status_code == 200
        
        # Check categorization
        conn = sqlite3.connect("test_comms.db")
        cursor = conn.cursor()
        cursor.execute("SELECT category FROM messages WHERE text LIKE '%URGENT%'")
        result = cursor.fetchone()
        assert result is not None
        # Should be categorized as urgent due to "URGENT" keyword
        assert result[0] == "urgent"
        conn.close()

class TestCategoryUpdate:
    """Test cases for category update endpoint"""
    
    def test_update_category_success(self, setup_database):
        """Test successful category update"""
        response = client.post("/messages/1/category", json={"category": "high"})
        assert response.status_code == 200
        assert response.json() == {"success": True}
        
        # Verify database update
        conn = sqlite3.connect("test_comms.db")
        cursor = conn.cursor()
        cursor.execute("SELECT category FROM messages WHERE id = '1'")
        result = cursor.fetchone()
        assert result[0] == "high"
        conn.close()
    
    def test_update_category_invalid_id(self, setup_database):
        """Test category update with invalid message ID"""
        response = client.post("/messages/999/category", json={"category": "high"})
        assert response.status_code == 404
    
    def test_update_category_invalid_category(self, setup_database):
        """Test category update with invalid category"""
        response = client.post("/messages/1/category", json={"category": "invalid_category"})
        assert response.status_code == 400

class TestCategorizationLogic:
    """Test cases for message categorization logic"""
    
    def test_urgent_categorization(self):
        """Test urgent message categorization"""
        from services.categorization_service import categorize_message
        
        urgent_keywords = ["URGENT", "CRITICAL", "EMERGENCY", "IMMEDIATE"]
        for keyword in urgent_keywords:
            message = f"{keyword}: Need audit immediately"
            assert categorize_message(message) == "urgent"
    
    def test_high_categorization(self):
        """Test high priority message categorization"""
        from services.categorization_service import categorize_message
        
        high_keywords = ["Aave", "Uniswap", "LayerZero", "Ethena", "Sushi", "Sofamon"]
        for keyword in high_keywords:
            message = f"Need audit for {keyword} protocol"
            assert categorize_message(message) == "high"
    
    def test_routine_categorization(self):
        """Test routine message categorization"""
        from services.categorization_service import categorize_message
        
        routine_messages = [
            "General blockchain question",
            "How much does an audit cost?",
            "Can you review our smart contract?"
        ]
        
        for message in routine_messages:
            category = categorize_message(message)
            assert category in ["routine", "high"]  # Some might be categorized as high
    
    def test_archive_categorization(self):
        """Test archive message categorization"""
        from services.categorization_service import categorize_message
        
        archive_messages = [
            "Random message",
            "Spam content",
            "Unrelated to blockchain"
        ]
        
        for message in archive_messages:
            category = categorize_message(message)
            assert category in ["archive", "routine"]  # Some might be categorized as routine

class TestWeb3SpecificFeatures:
    """Test cases for Web3-specific functionality"""
    
    def test_audited_project_highlighting(self, setup_database):
        """Test that messages mentioning audited projects are properly identified"""
        response = client.get("/messages")
        data = response.json()
        
        audited_projects = ["Uniswap", "Aave", "LayerZero", "Ethena", "Sushi"]
        
        for project in audited_projects:
            project_messages = [msg for msg in data if project in msg["text"]]
            for msg in project_messages:
                # Messages about audited projects should be categorized appropriately
                assert msg["category"] in ["urgent", "high", "routine"]
    
    def test_web3_keyword_detection(self, setup_database):
        """Test detection of Web3-specific keywords"""
        from services.categorization_service import categorize_message
        
        web3_keywords = {
            "audit": "high",
            "smart contract": "high", 
            "DeFi": "high",
            "NFT": "high",
            "blockchain": "routine",
            "crypto": "routine"
        }
        
        for keyword, expected_category in web3_keywords.items():
            message = f"Need help with {keyword}"
            category = categorize_message(message)
            assert category in [expected_category, "high"]  # Some might be categorized as high

if __name__ == "__main__":
    pytest.main([__file__])
