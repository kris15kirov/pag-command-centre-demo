try:
    import tweepy
    TWITTER_AVAILABLE = True
except ImportError:
    TWITTER_AVAILABLE = False

from config.config import TWITTER_BEARER_TOKEN, PROJECT_FEEDS, PASHOV_AUDIT_GROUP, USE_MOCK_DATA
import logging
from datetime import datetime

logging.basicConfig(filename="logs/app.log", level=logging.INFO)
logger = logging.getLogger(__name__)

async def fetch_twitter_feed(twitter_id):
    """Fetch Twitter feed for a specific project or account"""
    if USE_MOCK_DATA:
        return [
            {
                "id": f"mock_{twitter_id}_1",
                "source": "TwitterFeed",
                "sender": twitter_id,
                "content": f"Mock update from {twitter_id} - New protocol features released!",
                "timestamp": datetime.now().isoformat(),
                "category": "routine"
            },
            {
                "id": f"mock_{twitter_id}_2",
                "source": "TwitterFeed",
                "sender": twitter_id,
                "content": f"{twitter_id} announces partnership with major DeFi protocol",
                "timestamp": datetime.now().isoformat(),
                "category": "high_priority"
            }
        ]
    
    if not TWITTER_AVAILABLE:
        logger.warning("Twitter API not available - using mock data")
        return []
        
    try:
        client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN)
        tweets = client.get_users_tweets(id=twitter_id, max_results=10)
        
        if not tweets.data:
            return []
            
        return [
            {
                "id": str(tweet.id),
                "source": "TwitterFeed",
                "sender": twitter_id,
                "content": tweet.text or "",
                "timestamp": tweet.created_at.isoformat(),
                "category": "routine"  # Will be categorized by main service
            }
            for tweet in tweets.data
        ]
    except Exception as e:
        logger.error(f"Failed to fetch Twitter feed for {twitter_id}: {e}")
        return []

async def fetch_audited_project_feeds():
    """Fetch Twitter feeds for all audited projects"""
    feeds = {}
    for project, details in PROJECT_FEEDS.items():
        if details and project != 'none':
            feeds[project] = await fetch_twitter_feed(details['twitter_id'])
            logger.info(f"Fetched {len(feeds[project])} tweets for {project}")
    return feeds

async def fetch_pashov_audit_group_feed():
    """Fetch Pashov Audit Group's Twitter feed"""
    feed = await fetch_twitter_feed(PASHOV_AUDIT_GROUP['twitter_id'])
    logger.info(f"Fetched {len(feed)} tweets for Pashov Audit Group")
    return feed

async def get_project_feed_summary():
    """Get a summary of all project feeds"""
    project_feeds = await fetch_audited_project_feeds()
    pashov_feed = await fetch_pashov_audit_group_feed()
    
    summary = {
        "total_tweets": sum(len(feed) for feed in project_feeds.values()) + len(pashov_feed),
        "projects": {project: len(feed) for project, feed in project_feeds.items()},
        "pashov_audit_group": len(pashov_feed)
    }
    
    return summary
