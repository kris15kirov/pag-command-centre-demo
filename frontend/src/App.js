import React, { useState, useEffect } from 'react';
import { RefreshCw, MessageCircle, Twitter, Filter, Copy, Clock } from 'lucide-react';
import MessageList from './components/MessageList';
import Sidebar from './components/Sidebar';
import TemplatesPanel from './components/TemplatesPanel';
import StatsPanel from './components/StatsPanel';
import { fetchMessages, fetchTemplates, refreshMessages, fetchStats } from './services/api';

function App() {
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    category: null,
    source: null
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [messagesData, templatesData, statsData] = await Promise.all([
        fetchMessages(),
        fetchTemplates(),
        fetchStats()
      ]);
      
      setMessages(messagesData);
      setTemplates(templatesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const result = await refreshMessages();
      console.log('Refresh result:', result);
      
      // Reload messages and stats after refresh
      const [messagesData, statsData] = await Promise.all([
        fetchMessages(),
        fetchStats()
      ]);
      
      setMessages(messagesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error refreshing messages:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    try {
      const filteredMessages = await fetchMessages(newFilters);
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error filtering messages:', error);
    }
  };

  const handleCategoryUpdate = async (messageId, newCategory) => {
    try {
      // Update the message category
      const response = await fetch(`/api/messages/${messageId}/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory }),
      });

      if (response.ok) {
        // Update the message in the local state
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageId ? { ...msg, category: newCategory } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error updating message category:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Comms Command Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-8 w-8 text-primary-600" />
                <h1 className="text-xl font-bold text-gray-900">Comms Command Center</h1>
              </div>
              <span className="text-sm text-gray-500">for Krum</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <StatsPanel stats={stats} />
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-primary flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <div className="col-span-3">
            <Sidebar 
              filters={filters}
              onFilterChange={handleFilterChange}
              stats={stats}
            />
          </div>

          {/* Main Content - Message List */}
          <div className="col-span-6">
            <MessageList 
              messages={messages}
              onCategoryUpdate={handleCategoryUpdate}
            />
          </div>

          {/* Right Sidebar - Templates */}
          <div className="col-span-3">
            <TemplatesPanel templates={templates} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
