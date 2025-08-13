import os
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random

class TwitterService:
    def __init__(self):
        self.bearer_token = os.getenv("TWITTER_BEARER_TOKEN")
        self.use_mock_data = not self.bearer_token or self.bearer_token == "your_twitter_bearer_token_here"
        
        # Enhanced mock data with Web3-specific content
        self.mock_mentions = [
            {
                "id": "tw_001",
                "sender": "@crypto_enthusiast",
                "content": "@krum_web3 Great project! When is the next token launch? 🚀",
                "timestamp": datetime.now() - timedelta(minutes=25)
            },
            {
                "id": "tw_002",
                "sender": "@defi_analyst",
                "content": "@krum_web3 URGENT: Found a potential security vulnerability in your smart contract. DM me ASAP!",
                "timestamp": datetime.now() - timedelta(minutes=10)
            },
            {
                "id": "tw_003",
                "sender": "@blockchain_dev",
                "content": "@krum_web3 The dApp is down! Users are complaining on Discord. Need immediate fix!",
                "timestamp": datetime.now() - timedelta(minutes=3)
            },
            {
                "id": "tw_004",
                "sender": "@web3_investor",
                "content": "@krum_web3 Love the new features! The UI is much better now. Keep up the great work! 👏",
                "timestamp": datetime.now() - timedelta(hours=1)
            },
            {
                "id": "tw_005",
                "sender": "@crypto_podcast",
                "content": "@krum_web3 Would love to have you on our podcast to discuss the future of DeFi!",
                "timestamp": datetime.now() - timedelta(hours=30)
            },
            {
                "id": "tw_006",
                "sender": "@nft_collector",
                "content": "@krum_web3 When are you launching the NFT collection? The community is excited! 🎨",
                "timestamp": datetime.now() - timedelta(hours=2)
            },
            # Web3-specific mentions
            {
                "id": "tw_007",
                "sender": "@defi_founder",
                "content": "@krum_web3 Need audit for my Uniswap fork! Pashov Audit Group is the best! 🔥",
                "timestamp": datetime.now() - timedelta(minutes=40)
            },
            {
                "id": "tw_008",
                "sender": "@aave_user",
                "content": "@krum_web3 How does Aave's lending protocol compare to Compound? Looking for insights!",
                "timestamp": datetime.now() - timedelta(minutes=15)
            },
            {
                "id": "tw_009",
                "sender": "@layerzero_builder",
                "content": "@krum_web3 Building cross-chain bridges like LayerZero. Need security audit!",
                "timestamp": datetime.now() - timedelta(minutes=8)
            },
            {
                "id": "tw_010",
                "sender": "@sushi_chef",
                "content": "@krum_web3 Our Sushi fork needs review. Can you audit it like you did for the original?",
                "timestamp": datetime.now() - timedelta(minutes=30)
            },
            {
                "id": "tw_011",
                "sender": "@ethena_builder",
                "content": "@krum_web3 Building a stablecoin protocol similar to Ethena. Need your expertise!",
                "timestamp": datetime.now() - timedelta(minutes=18)
            },
            {
                "id": "tw_012",
                "sender": "@karak_dev",
                "content": "@krum_web3 Karak's restaking protocol is amazing! Can you audit our similar implementation?",
                "timestamp": datetime.now() - timedelta(minutes=12)
            }
        ]

    async def fetch_mentions(self) -> List[Dict[str, Any]]:
        """Fetch mentions from Twitter or return mock data"""
        if self.use_mock_data:
            return self._get_mock_mentions()
        else:
            return await self._fetch_real_mentions()

    def _get_mock_mentions(self) -> List[Dict[str, Any]]:
        """Return mock mentions for demonstration"""
        # Randomly select 3-5 mentions to simulate new incoming mentions
        num_mentions = random.randint(3, 5)
        selected_mentions = random.sample(self.mock_mentions, num_mentions)
        
        # Add some randomness to timestamps
        for mention in selected_mentions:
            mention["timestamp"] = datetime.now() - timedelta(
                minutes=random.randint(1, 60)
            )
        
        return selected_mentions

    async def _fetch_real_mentions(self) -> List[Dict[str, Any]]:
        """Fetch real mentions from Twitter API v2"""
        try:
            # This would be implemented with tweepy library
            # For now, return mock data as fallback
            return self._get_mock_mentions()
        except Exception as e:
            print(f"Error fetching Twitter mentions: {e}")
            return []

    async def reply_to_tweet(self, tweet_id: str, reply_text: str) -> bool:
        """Reply to a tweet via Twitter API"""
        if self.use_mock_data:
            print(f"[MOCK] Replying to tweet {tweet_id}: {reply_text}")
            return True
        
        try:
            # Implement real Twitter reply logic here
            return True
        except Exception as e:
            print(f"Error replying to tweet: {e}")
            return False

    async def get_user_info(self, username: str) -> Dict[str, Any]:
        """Get user information from Twitter"""
        if self.use_mock_data:
            return {
                "id": f"user_{random.randint(1000, 9999)}",
                "username": username,
                "name": f"Mock User {username}",
                "followers_count": random.randint(100, 10000),
                "verified": random.choice([True, False])
            }
        
        try:
            # Implement real Twitter user info logic here
            return {}
        except Exception as e:
            print(f"Error fetching user info: {e}")
            return {}
