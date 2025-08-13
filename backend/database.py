from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

# Database URL from environment or default to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./comms_center.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    from models import Message, MessageCategory, MessageSource  # Import here to avoid circular imports
    Base.metadata.create_all(bind=engine)
    
    # Add sample data if database is empty
    db = SessionLocal()
    try:
        # Check if we already have messages
        existing_messages = db.query(Message).count()
        if existing_messages == 0:
            # Add sample messages
            sample_messages = [
                Message(
                    sender="crypto_builder_123",
                    content="Looking for a smart contract audit for our new DeFi protocol. Heard great things about Pashov Audit Group from Uniswap team!",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(hours=2)
                ),
                Message(
                    sender="web3_developer",
                    content="Need urgent audit for LayerZero integration. Can Pashov Audit Group help?",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.URGENT,
                    timestamp=datetime.now() - timedelta(hours=1)
                ),
                Message(
                    sender="defi_founder",
                    content="Building something similar to Aave. Would love to get audited by the same team!",
                    source=MessageSource.TWITTER,
                    category=MessageCategory.ROUTINE,
                    timestamp=datetime.now() - timedelta(minutes=30)
                ),
                Message(
                    sender="nft_creator",
                    content="Working on a Blueberry Protocol inspired NFT project. Need security audit recommendations.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(minutes=15)
                ),
                Message(
                    sender="arbitrum_dev",
                    content="Excited to build on Arbitrum! Looking for audit partners who understand the ecosystem.",
                    source=MessageSource.TWITTER,
                    category=MessageCategory.ROUTINE,
                    timestamp=datetime.now() - timedelta(minutes=5)
                ),
                Message(
                    sender="sushi_fan",
                    content="Love what Sushi has built! Want to create something similar. Need audit help.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(minutes=2)
                ),
                Message(
                    sender="ethena_builder",
                    content="Inspired by Ethena's innovation. Building stablecoin protocol. Audit recommendations?",
                    source=MessageSource.TWITTER,
                    category=MessageCategory.URGENT,
                    timestamp=datetime.now()
                ),
                # Additional Telegram messages with urgent notifications
                Message(
                    sender="🚨 CRITICAL_ALERT",
                    content="URGENT: Smart contract vulnerability detected in production! Need immediate security review. Users at risk!",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.URGENT,
                    timestamp=datetime.now() - timedelta(minutes=10)
                ),
                Message(
                    sender="DeFi_Security_Team",
                    content="🚨 EMERGENCY: Flash loan attack detected on our protocol! Need Pashov Audit Group assistance immediately!",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.URGENT,
                    timestamp=datetime.now() - timedelta(minutes=8)
                ),
                Message(
                    sender="Protocol_Manager",
                    content="URGENT: Users reporting failed transactions. Smart contract may have critical bug. Need audit team on call!",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.URGENT,
                    timestamp=datetime.now() - timedelta(minutes=6)
                ),
                Message(
                    sender="LayerZero_Dev",
                    content="Need urgent cross-chain bridge audit. Found potential reentrancy vulnerability. Can Pashov team help?",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.URGENT,
                    timestamp=datetime.now() - timedelta(minutes=4)
                ),
                Message(
                    sender="Stablecoin_Team",
                    content="🚨 CRITICAL: Our stablecoin is depegging! Need immediate audit of liquidation mechanism!",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.URGENT,
                    timestamp=datetime.now() - timedelta(minutes=3)
                ),
                Message(
                    sender="Yield_Farmer",
                    content="High priority: Yield farming protocol showing unusual APY. Need security audit before launch.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(minutes=12)
                ),
                Message(
                    sender="NFT_Marketplace",
                    content="Building NFT marketplace similar to OpenSea. Need comprehensive security audit. High priority.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(minutes=18)
                ),
                Message(
                    sender="DAO_Governance",
                    content="Governance token launch in 24 hours. Need urgent audit of voting mechanism and tokenomics.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(minutes=25)
                ),
                Message(
                    sender="Cross_Chain_Dev",
                    content="Building bridge between Ethereum and Arbitrum. Need audit of cross-chain message passing.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(minutes=35)
                ),
                Message(
                    sender="Lending_Protocol",
                    content="DeFi lending protocol ready for audit. Similar to Aave but with new features. High priority.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(minutes=45)
                ),
                Message(
                    sender="DEX_Developer",
                    content="Building DEX with concentrated liquidity like Uniswap V4. Need audit before mainnet launch.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.HIGH_PRIORITY,
                    timestamp=datetime.now() - timedelta(minutes=55)
                ),
                Message(
                    sender="Staking_Protocol",
                    content="Liquid staking protocol for ETH. Need audit of staking mechanism and reward distribution.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.ROUTINE,
                    timestamp=datetime.now() - timedelta(hours=1, minutes=10)
                ),
                Message(
                    sender="Insurance_DeFi",
                    content="DeFi insurance protocol. Need audit of claim processing and risk assessment algorithms.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.ROUTINE,
                    timestamp=datetime.now() - timedelta(hours=1, minutes=25)
                ),
                Message(
                    sender="Gaming_NFT",
                    content="NFT gaming platform. Need audit of in-game token economics and NFT marketplace.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.ROUTINE,
                    timestamp=datetime.now() - timedelta(hours=1, minutes=40)
                ),
                Message(
                    sender="Prediction_Market",
                    content="Decentralized prediction market. Need audit of oracle integration and market resolution.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.ROUTINE,
                    timestamp=datetime.now() - timedelta(hours=1, minutes=55)
                ),
                Message(
                    sender="Social_DeFi",
                    content="Social trading platform. Need audit of copy trading mechanism and risk management.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.ROUTINE,
                    timestamp=datetime.now() - timedelta(hours=2, minutes=10)
                ),
                Message(
                    sender="Archive_Project",
                    content="Old project from 2023. Just checking if you're still available for audits.",
                    source=MessageSource.TELEGRAM,
                    category=MessageCategory.ARCHIVE,
                    timestamp=datetime.now() - timedelta(days=30)
                )
            ]
            
            db.add_all(sample_messages)
            db.commit()
            print("Sample data added to database")
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()
