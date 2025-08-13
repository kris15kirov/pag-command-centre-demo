import pytest
import sys
import os
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch, MagicMock

client = TestClient(app)

class TestBasicEndpoints:
    """Test basic API endpoints"""
    
    def test_root_endpoint(self):
        """Test the root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Comms Command Center API" in data["message"]
    
    def test_messages_endpoint(self):
        """Test the messages endpoint"""
        response = client.get("/api/messages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_templates_endpoint(self):
        """Test the templates endpoint"""
        response = client.get("/api/templates")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "name" in data[0]
        assert "content" in data[0]
    
    def test_projects_endpoint(self):
        """Test the projects endpoint"""
        response = client.get("/api/projects")
        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        assert isinstance(data["projects"], dict)
    
    def test_analytics_endpoint(self):
        """Test the analytics endpoint"""
        response = client.get("/api/analytics")
        assert response.status_code == 200
        data = response.json()
        assert "overview" in data
        assert "categories" in data
        assert "project_mentions" in data

class TestRefreshEndpoint:
    """Test cases for /api/refresh endpoint"""
    
    @patch('services.telegram_service.TelegramService.fetch_messages')
    @patch('services.twitter_service.TwitterService.fetch_mentions')
    def test_refresh_messages_success(self, mock_twitter, mock_telegram):
        """Test successful refresh of messages from external APIs"""
        # Mock external service responses
        mock_telegram.return_value = [
            {
                "id": "refresh_test_1",
                "sender": "@NewClient",
                "content": "Need Ethena audit for new protocol",
                "timestamp": "2025-08-12T10:20:00Z"
            }
        ]
        
        mock_twitter.return_value = [
            {
                "id": "refresh_test_2",
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

class TestCategorizationLogic:
    """Test cases for message categorization logic"""
    
    def test_urgent_categorization(self):
        """Test urgent message categorization"""
        from services.categorization_service import CategorizationService
        from models import MessageCategory
        
        service = CategorizationService()
        urgent_keywords = ["URGENT", "CRITICAL", "EMERGENCY", "IMMEDIATE"]
        for keyword in urgent_keywords:
            message = f"{keyword}: Need audit immediately"
            category = service.categorize_message(message)
            assert category == MessageCategory.URGENT
    
    def test_web3_keyword_detection(self):
        """Test detection of Web3-specific keywords"""
        from services.categorization_service import CategorizationService
        from models import MessageCategory
        
        service = CategorizationService()
        
        # Test that Web3 keywords are properly detected
        web3_messages = [
            "Need audit for Aave protocol",
            "Smart contract review needed",
            "DeFi protocol security check"
        ]
        
        for message in web3_messages:
            category = service.categorize_message(message)
            # Should be categorized as high priority or urgent
            assert category in [MessageCategory.HIGH_PRIORITY, MessageCategory.URGENT]

class TestWeb3SpecificFeatures:
    """Test cases for Web3-specific functionality"""
    
    def test_audited_projects_config(self):
        """Test that audited projects are properly configured"""
        from config.config import AUDITED_PROJECTS
        
        # Check that audited projects are defined
        assert isinstance(AUDITED_PROJECTS, dict)
        assert len(AUDITED_PROJECTS) > 0
        
        # Check for specific projects
        expected_projects = ["Uniswap", "Aave", "LayerZero", "Ethena", "Sushi"]
        for project in expected_projects:
            found = False
            for category, projects in AUDITED_PROJECTS.items():
                if project in projects:
                    found = True
                    break
            assert found, f"Project {project} not found in audited projects config"

if __name__ == "__main__":
    pytest.main([__file__])
