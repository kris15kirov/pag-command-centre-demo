import re
from typing import List
from models import MessageCategory
from config.config import (
    AUDITED_PROJECTS, 
    WEB3_URGENT_KEYWORDS, 
    WEB3_HIGH_PRIORITY_KEYWORDS, 
    WEB3_ARCHIVE_KEYWORDS,
    IMPORTANT_WEB3_SENDERS
)

class CategorizationService:
    def __init__(self):
        # Use Web3-specific keywords from config
        self.urgent_keywords = WEB3_URGENT_KEYWORDS
        self.high_priority_keywords = WEB3_HIGH_PRIORITY_KEYWORDS
        self.archive_keywords = WEB3_ARCHIVE_KEYWORDS
        self.important_senders = IMPORTANT_WEB3_SENDERS
        
        # Flatten audited projects for easier checking
        self.audited_projects = []
        for category, projects in AUDITED_PROJECTS.items():
            self.audited_projects.extend(projects)

    def categorize_message(self, content: str, sender: str = "") -> MessageCategory:
        """
        Categorize a message based on its content and sender with Web3-specific logic
        Returns: MessageCategory (URGENT, HIGH_PRIORITY, ROUTINE, or ARCHIVE)
        """
        content_lower = content.lower()
        sender_lower = sender.lower()
        
        # Check for urgent keywords first (highest priority)
        if self._contains_urgent_keywords(content_lower):
            return MessageCategory.URGENT
        
        # Check for archive keywords
        if self._contains_archive_keywords(content_lower):
            return MessageCategory.ARCHIVE
        
        # Check for high priority keywords, important senders, or audited project mentions
        if (self._contains_high_priority_keywords(content_lower) or 
            self._is_important_sender(sender_lower) or
            self._mentions_audited_project(content_lower)):
            return MessageCategory.HIGH_PRIORITY
        
        # Default to routine
        return MessageCategory.ROUTINE

    def _contains_urgent_keywords(self, content: str) -> bool:
        """Check if content contains urgent keywords"""
        for keyword in self.urgent_keywords:
            if keyword in content:
                return True
        return False

    def _contains_high_priority_keywords(self, content: str) -> bool:
        """Check if content contains high priority keywords"""
        for keyword in self.high_priority_keywords:
            if keyword in content:
                return True
        return False

    def _contains_archive_keywords(self, content: str) -> bool:
        """Check if content contains archive keywords"""
        for keyword in self.archive_keywords:
            if keyword in content:
                return True
        return False

    def _is_important_sender(self, sender: str) -> bool:
        """Check if sender is considered important"""
        for important_term in self.important_senders:
            if important_term in sender:
                return True
        return False

    def _mentions_audited_project(self, content: str) -> bool:
        """Check if content mentions any audited project"""
        for project in self.audited_projects:
            if project.lower() in content:
                return True
        return False

    def get_mentioned_projects(self, content: str) -> List[str]:
        """Get list of audited projects mentioned in the content"""
        mentioned = []
        for project in self.audited_projects:
            if project.lower() in content.lower():
                mentioned.append(project)
        return mentioned

    def get_category_explanation(self, content: str, sender: str = "") -> str:
        """Get explanation for why a message was categorized as it was"""
        content_lower = content.lower()
        sender_lower = sender.lower()
        
        if self._contains_urgent_keywords(content_lower):
            found_keywords = [kw for kw in self.urgent_keywords if kw in content_lower]
            return f"Marked as URGENT due to keywords: {', '.join(found_keywords)}"
        
        if self._contains_archive_keywords(content_lower):
            found_keywords = [kw for kw in self.archive_keywords if kw in content_lower]
            return f"Marked as ARCHIVE due to keywords: {', '.join(found_keywords)}"
        
        if self._mentions_audited_project(content_lower):
            mentioned_projects = self.get_mentioned_projects(content_lower)
            return f"Marked as HIGH PRIORITY due to audited project mentions: {', '.join(mentioned_projects)}"
        
        if self._contains_high_priority_keywords(content_lower):
            found_keywords = [kw for kw in self.high_priority_keywords if kw in content_lower]
            return f"Marked as HIGH PRIORITY due to keywords: {', '.join(found_keywords)}"
        
        if self._is_important_sender(sender_lower):
            return f"Marked as HIGH PRIORITY due to important sender: {sender}"
        
        return "Marked as ROUTINE - no specific keywords or sender indicators found"

    def update_keywords(self, category: MessageCategory, keywords: List[str], action: str = "add"):
        """Update keywords for a category (for future enhancement)"""
        if action == "add":
            if category == MessageCategory.URGENT:
                self.urgent_keywords.extend(keywords)
            elif category == MessageCategory.HIGH_PRIORITY:
                self.high_priority_keywords.extend(keywords)
            elif category == MessageCategory.ARCHIVE:
                self.archive_keywords.extend(keywords)
        elif action == "remove":
            if category == MessageCategory.URGENT:
                self.urgent_keywords = [kw for kw in self.urgent_keywords if kw not in keywords]
            elif category == MessageCategory.HIGH_PRIORITY:
                self.high_priority_keywords = [kw for kw in self.high_priority_keywords if kw not in keywords]
            elif category == MessageCategory.ARCHIVE:
                self.archive_keywords = [kw for kw in self.archive_keywords if kw not in keywords]
