import os
from dotenv import load_dotenv

load_dotenv()

# API Configuration
USE_MOCK_DATA = os.getenv("USE_MOCK_DATA", "True").lower() == "true"
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "your_telegram_bot_token_here")
TWITTER_BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN", "your_twitter_bearer_token_here")

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./comms_center.db")

# Server Configuration
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

# Web3-Specific Configuration
AUDITED_PROJECTS = {
    "dex": ["Uniswap", "Sushi", "PancakeSwap", "dYdX"],
    "lending": ["Aave", "Compound", "MakerDAO"],
    "stablecoin": ["USDC", "USDT", "DAI", "FRAX"],
    "infrastructure": ["LayerZero", "Polygon", "Arbitrum", "Optimism"],
    "nft": ["Sofamon", "Bored Ape", "CryptoPunks"],
    "defi": ["Ethena", "Karak", "Curve", "Balancer"],
    "others": ["Chainlink", "The Graph", "Filecoin"]
}

# Enhanced Project Feeds Configuration
PROJECT_FEEDS = {
    'none': None,
    'Uniswap': {'twitter_id': 'Uniswap', 'handle': '@Uniswap'},
    'Aave': {'twitter_id': 'Aave', 'handle': '@Aave'},
    'LayerZero': {'twitter_id': 'LayerZero_Labs', 'handle': '@LayerZero_Labs'},
    'Ethena': {'twitter_id': 'EthenaLabs', 'handle': '@EthenaLabs'},
    'Sushi': {'twitter_id': 'SushiSwap', 'handle': '@SushiSwap'},
    'Arbitrum': {'twitter_id': 'arbitrum', 'handle': '@arbitrum'},
    'Blueberry': {'twitter_id': 'BlueberryFi', 'handle': '@BlueberryFi'}
}

PASHOV_AUDIT_GROUP = {
    'twitter_id': 'PashovAuditGrp',
    'handle': '@PashovAuditGrp',
    'bio': 'Solidity, Rust, Cairo, Go, Vyper, web2 audits company. Trusted by Aave, Uniswap, Lido, LayerZero, Ethena, Euler, Pumpfun. Book an audit: http://t.me/pashovkrum',
    'website': 'pashov.net'
}

# Web3-specific keywords for categorization
WEB3_URGENT_KEYWORDS = [
    'urgent', 'emergency', 'critical', 'broken', 'down', 'error',
    'bug', 'hack', 'security', 'vulnerability', 'exploit', 'attack',
    'help', 'asap', 'immediate', 'now', 'stop', 'fix', 'issue',
    'problem', 'fail', 'crash', 'disaster', 'panic', 'audit'
]

WEB3_HIGH_PRIORITY_KEYWORDS = [
    'important', 'priority', 'key', 'major', 'significant',
    'partnership', 'deal', 'investment', 'funding', 'launch',
    'release', 'deadline', 'meeting', 'call', 'discussion',
    'proposal', 'opportunity', 'collaboration', 'business',
    'defi', 'nft', 'smart contract', 'protocol', 'token',
    'blockchain', 'crypto', 'web3', 'dao', 'governance'
]

WEB3_ARCHIVE_KEYWORDS = [
    'old', 'previous', 'past', 'history', 'archive', 'done',
    'completed', 'finished', 'closed', 'resolved', 'solved',
    'thank', 'thanks', 'appreciate', 'gratitude', 'old news'
]

# Important Web3 senders
IMPORTANT_WEB3_SENDERS = [
    'investor', 'partner', 'ceo', 'founder', 'executive',
    'board', 'advisor', 'mentor', 'key', 'vip', 'dev',
    'developer', 'auditor', 'security', 'defi', 'nft'
]
