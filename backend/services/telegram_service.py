import os
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random

class TelegramService:
    def __init__(self):
        self.bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
        self.use_mock_data = not self.bot_token or self.bot_token == "your_telegram_bot_token_here"
        
        # Enhanced mock data with Web3-specific content
        self.mock_messages = [
            {
                "id": "tg_001",
                "sender": "Alice Crypto",
                "content": "Hey Krum! The new token launch is looking great. When can we expect the whitepaper?",
                "timestamp": datetime.now() - timedelta(minutes=30)
            },
            {
                "id": "tg_002", 
                "sender": "Bob Investor",
                "content": "URGENT: There's a critical bug in the smart contract. Need immediate attention!",
                "timestamp": datetime.now() - timedelta(minutes=15)
            },
            {
                "id": "tg_003",
                "sender": "Charlie Dev",
                "content": "The frontend is broken, users can't connect their wallets. This is urgent!",
                "timestamp": datetime.now() - timedelta(minutes=5)
            },
            {
                "id": "tg_004",
                "sender": "Diana Community",
                "content": "Thanks for the AMA yesterday! The community loved it.",
                "timestamp": datetime.now() - timedelta(hours=2)
            },
            {
                "id": "tg_005",
                "sender": "Eve Partner",
                "content": "Important partnership discussion - can we schedule a call this week?",
                "timestamp": datetime.now() - timedelta(hours=1)
            },
            # Web3-specific messages
            {
                "id": "tg_006",
                "sender": "DeFi Founder",
                "content": "Need urgent audit for my Uniswap fork! Can you help?",
                "timestamp": datetime.now() - timedelta(minutes=45)
            },
            {
                "id": "tg_007",
                "sender": "NFT Creator",
                "content": "How does Aave's lending protocol work? Looking to integrate similar features.",
                "timestamp": datetime.now() - timedelta(minutes=20)
            },
            {
                "id": "tg_008",
                "sender": "LayerZero Dev",
                "content": "Interested in cross-chain integration like LayerZero. Any advice?",
                "timestamp": datetime.now() - timedelta(minutes=10)
            },
            {
                "id": "tg_009",
                "sender": "Sushi Chef",
                "content": "Our Sushi fork needs security review. Can Pashov Audit Group help?",
                "timestamp": datetime.now() - timedelta(minutes=35)
            },
            {
                "id": "tg_010",
                "sender": "Ethena Builder",
                "content": "Building a stablecoin protocol similar to Ethena. Need audit recommendations.",
                "timestamp": datetime.now() - timedelta(minutes=25)
            }
        ]

    async def fetch_messages(self) -> List[Dict[str, Any]]:
        """Fetch messages from Telegram or return mock data"""
        if self.use_mock_data:
            return self._get_mock_messages()
        else:
            return await self._fetch_real_messages()

    def _get_mock_messages(self) -> List[Dict[str, Any]]:
        """Return mock messages for demonstration"""
        # Randomly select 3-5 messages to simulate new incoming messages
        num_messages = random.randint(3, 5)
        selected_messages = random.sample(self.mock_messages, num_messages)
        
        # Add some randomness to timestamps
        for msg in selected_messages:
            msg["timestamp"] = datetime.now() - timedelta(
                minutes=random.randint(1, 60)
            )
        
        return selected_messages

    async def _fetch_real_messages(self) -> List[Dict[str, Any]]:
        """Fetch real messages from Telegram Bot API"""
        try:
            # This would be implemented with python-telegram-bot library
            # For now, return mock data as fallback
            return self._get_mock_messages()
        except Exception as e:
            print(f"Error fetching Telegram messages: {e}")
            return []

    async def send_message(self, chat_id: str, message: str) -> bool:
        """Send a message via Telegram Bot API"""
        if self.use_mock_data:
            print(f"[MOCK] Sending message to {chat_id}: {message}")
            return True
        
        try:
            # Implement real Telegram sending logic here
            return True
        except Exception as e:
            print(f"Error sending Telegram message: {e}")
            return False
