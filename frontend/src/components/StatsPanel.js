import React from 'react';
import { MessageCircle, Twitter, AlertTriangle } from 'lucide-react';

const StatsPanel = ({ stats }) => {
  const urgentCount = stats.categories?.urgent || 0;
  const totalMessages = stats.total_messages || 0;

  return (
    <div className="flex items-center space-x-4">
      {/* Total Messages */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <MessageCircle className="h-4 w-4" />
        <span>{totalMessages} total</span>
      </div>
      
      {/* Urgent Messages */}
      {urgentCount > 0 && (
        <div className="flex items-center space-x-2 text-sm text-urgent-600 bg-urgent-50 px-3 py-1 rounded-full">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">{urgentCount} urgent</span>
        </div>
      )}
      
      {/* Source Breakdown */}
      <div className="flex items-center space-x-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <MessageCircle className="h-3 w-3 text-blue-500" />
          <span>{stats.telegram_messages || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Twitter className="h-3 w-3 text-blue-400" />
          <span>{stats.twitter_messages || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
