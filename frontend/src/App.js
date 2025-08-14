import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEthereum, FaTelegram, FaTwitter, FaCopy, FaSync, FaFilter, FaRocket, FaShieldAlt, FaExclamationTriangle, FaChevronDown, FaTrash, FaGripVertical } from 'react-icons/fa';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Template Item Component
function SortableTemplateItem({ template, index, onDelete, onCopy }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="template-card mb-4 flex items-center justify-between group"
    >
      <div className="flex items-center flex-1">
        <button
          {...attributes}
          {...listeners}
          className="mr-3 text-gray-400 hover:text-web3-accent transition-colors cursor-grab active:cursor-grabbing"
          data-testid="drag-handle"
        >
          <FaGripVertical />
        </button>
        <p className="message-content text-sm flex-1">{template}</p>
      </div>
      <div className="flex items-center space-x-2 ml-3">
        <button
          onClick={() => onCopy(template)}
          className="web3-button-secondary flex items-center text-xs px-2 py-1"
        >
          <FaCopy className="mr-1" />
          Copy
        </button>
        <button
          onClick={() => onDelete(index)}
          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
          data-testid="delete-template"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [projectFeeds, setProjectFeeds] = useState({});
  const [category, setCategory] = useState('all');
  const [projectFilter, setProjectFilter] = useState('none');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState('');

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [templates, setTemplates] = useState([
    "Thanks for your audit request! Pashov Audit Group (trusted by Uniswap and Aave) will review your {project} and respond soon.",
    "Can you share more details about your {project} smart contract? We've audited similar protocols like Sushi and Ethena.",
    "Interested in LayerZero integration? Pashov Audit Group has audited their cross-chain contracts.",
    "For NFT projects like Blueberry Protocol, audited by us, please provide your contract address.",
    "We're excited to support Arbitrum builders—contact us for an audit!",
    "Your {project} audit is in progress. Expect a detailed report within 7 days from Pashov Audit Group.",
    "Please submit your smart contract code via http://t.me/pashovkrum for a Pashov Audit Group review.",
    "Congrats on your DeFi launch! Pashov Audit Group can ensure security—book an audit today.",
    "LayerZero cross-chain issues? Pashov Audit Group's expertise is at your service.",
    "Security audit completed for {project}. All critical vulnerabilities have been addressed."
  ]);

  useEffect(() => {
    console.log("App component mounted - fetching initial data");
    fetchMessages();
    fetchProjectFeeds();
    loadCustomTemplates();
  }, []);

  const fetchMessages = async () => {
    try {
      console.log("Fetching messages from API...");
      setError(null);
      const response = await axios.get('http://localhost:8000/api/messages');
      console.log("Messages fetched successfully:", response.data.length, "messages");
      console.log("Sample messages:", response.data.slice(0, 3));
      console.log("Message categories found:", [...new Set(response.data.map(msg => msg.category))]);
      console.log("Message sources found:", [...new Set(response.data.map(msg => msg.source))]);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(`Failed to fetch messages: ${error.message}`);
      // Add fallback data for better user experience
      setMessages([
        {
          id: 1,
          sender: "@TestUser",
          content: "Fallback message - API connection issue detected",
          source: "telegram",
          category: "routine",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const fetchProjectFeeds = async () => {
    try {
      console.log("Fetching project feeds from API...");
      const response = await axios.get('http://localhost:8000/api/project-feeds');
      console.log("Project feeds fetched successfully:", response.data);
      setProjectFeeds(response.data);
    } catch (error) {
      console.error('Error fetching project feeds:', error);
      // Add fallback data for better user experience
      setProjectFeeds({
        "PashovAuditGrp": [
          {
            content: "Fallback: Pashov Audit Group completed security review for major DeFi protocol",
            timestamp: new Date().toISOString()
          }
        ]
      });
    }
  };

  const updateCategory = async (id, newCategory) => {
    try {
      console.log(`Updating message ${id} category to ${newCategory}`);
      const response = await axios.post(`http://localhost:8000/api/messages/${id}/category`, {
        category: newCategory
      });

      if (response.status === 200) {
        setMessages(messages.map(msg =>
          msg.id === id ? { ...msg, category: newCategory } : msg
        ));
        console.log("Category updated successfully");
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError(`Failed to update category: ${error.message}`);
    }
  };



  const refreshMessages = async () => {
    try {
      console.log("Starting refresh process...");
      setLoading(true);
      setError(null);

      // Refresh messages
      console.log("Refreshing messages...");
      await axios.post('http://localhost:8000/api/refresh');

      // Refresh project feeds
      console.log("Refreshing project feeds...");
      await axios.post('http://localhost:8000/api/refresh-feeds');

      // Fetch updated data
      await fetchMessages();
      await fetchProjectFeeds();

      setLastRefresh(new Date());
      console.log("Refresh completed successfully");
    } catch (error) {
      console.error('Error refreshing messages:', error);
      setError(`Refresh failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      console.log("Template copied to clipboard");
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setError("Failed to copy template to clipboard");
    }
  };

  const saveTemplate = () => {
    if (newTemplate.trim()) {
      const updatedTemplates = [...templates, newTemplate.trim()];
      localStorage.setItem('customTemplates', JSON.stringify(updatedTemplates));
      setTemplates(updatedTemplates);
      setNewTemplate('');
      setShowTemplateModal(false);
      console.log("Template saved successfully:", newTemplate.trim());
    }
  };

  const loadCustomTemplates = () => {
    const savedTemplates = localStorage.getItem('customTemplates');
    if (savedTemplates) {
      const customTemplates = JSON.parse(savedTemplates);
      // Only add templates that aren't already in the default list
      const defaultTemplates = [
        "Thanks for your audit request! Pashov Audit Group (trusted by Uniswap and Aave) will review your {project} and respond soon.",
        "Can you share more details about your {project} smart contract? We've audited similar protocols like Sushi and Ethena.",
        "Interested in LayerZero integration? Pashov Audit Group has audited their cross-chain contracts.",
        "For NFT projects like Blueberry Protocol, audited by us, please provide your contract address.",
        "We're excited to support Arbitrum builders—contact us for an audit!",
        "Your {project} audit is in progress. Expect a detailed report within 7 days from Pashov Audit Group.",
        "Please submit your smart contract code via http://t.me/pashovkrum for a Pashov Audit Group review.",
        "Congrats on your DeFi launch! Pashov Audit Group can ensure security—book an audit today.",
        "LayerZero cross-chain issues? Pashov Audit Group's expertise is at your service.",
        "Security audit completed for {project}. All critical vulnerabilities have been addressed."
      ];
      const newTemplates = customTemplates.filter(template => !defaultTemplates.includes(template));
      if (newTemplates.length > 0) {
        setTemplates([...defaultTemplates, ...newTemplates]);
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTemplates((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);

        const newTemplates = arrayMove(items, oldIndex, newIndex);
        // Save to localStorage
        localStorage.setItem('customTemplates', JSON.stringify(newTemplates));
        console.log("Templates reordered:", newTemplates);
        return newTemplates;
      });
    }
  };

  const deleteTemplate = (index) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      const newTemplates = templates.filter((_, i) => i !== index);
      setTemplates(newTemplates);
      localStorage.setItem('customTemplates', JSON.stringify(newTemplates));
      console.log("Template deleted at index:", index);
    }
  };



  const getSourceIcon = (source) => {
    return source === 'TELEGRAM' ? <FaTelegram className="inline text-web3-highlight" /> : <FaTwitter className="inline text-web3-accent" />;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'high_priority': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case 'routine': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'archive': return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const telegramMessages = messages.filter(msg => {
    const categoryMatch = category === 'all' ||
      (category === 'urgent' && msg.category === 'urgent') ||
      (category === 'high' && msg.category === 'high_priority') ||
      (category === 'routine' && msg.category === 'routine') ||
      (category === 'archive' && msg.category === 'archive');
    const projectMatch = projectFilter === 'none' ||
      ['Uniswap', 'Aave', 'LayerZero', 'Ethena', 'Sushi'].some(project =>
        msg.content && msg.content.includes(project) && projectFilter === project
      );
    const sourceMatch = sourceFilter === 'all' || sourceFilter === 'TELEGRAM';

    return msg.source === 'TELEGRAM' && categoryMatch && projectMatch && sourceMatch;
  });

  const twitterMessages = messages.filter(msg => {
    const categoryMatch = category === 'all' ||
      (category === 'urgent' && msg.category === 'urgent') ||
      (category === 'high' && msg.category === 'high_priority') ||
      (category === 'routine' && msg.category === 'routine') ||
      (category === 'archive' && msg.category === 'archive');
    const projectMatch = projectFilter === 'none' ||
      ['Uniswap', 'Aave', 'LayerZero', 'Ethena', 'Sushi'].some(project =>
        msg.content && msg.content.includes(project) && projectFilter === project
      );
    const sourceMatch = sourceFilter === 'all' || sourceFilter === 'TWITTER';

    return (msg.source === 'TWITTER' || msg.source === 'TWITTER_FEED') && categoryMatch && projectMatch && sourceMatch;
  });

  // Debug logging for state changes
  console.log('Current state:', {
    totalMessages: messages.length,
    telegramMessages: telegramMessages.length,
    twitterMessages: twitterMessages.length,
    category,
    projectFilter,
    sourceFilter,
  });

  // Test filtering logic with sample data
  const testFiltering = () => {
    const testMessages = [
      { id: 1, sender: 'Test1', category: 'urgent', source: 'TELEGRAM', content: 'Test urgent' },
      { id: 2, sender: 'Test2', category: 'high_priority', source: 'TWITTER', content: 'Test high' },
      { id: 3, sender: 'Test3', category: 'routine', source: 'TELEGRAM', content: 'Test routine' }
    ];

    const testFiltered = testMessages.filter(msg => {
      const categoryMatch = category === 'all' ||
        (category === 'urgent' && msg.category === 'urgent') ||
        (category === 'high' && msg.category === 'high_priority') ||
        (category === 'routine' && msg.category === 'routine');
      return categoryMatch;
    });

    console.log('Test filtering:', {
      category,
      testMessages: testMessages.length,
      testFiltered: testFiltered.length,
      testResults: testFiltered
    });
  };

  // Run test when category changes
  React.useEffect(() => {
    testFiltering();
  }, [category, testFiltering]);

  const auditedProjects = ['Uniswap', 'Aave', 'LayerZero', 'Ethena', 'Sushi', 'Arbitrum', 'Blueberry'];

  // Error display component
  const ErrorDisplay = ({ error }) => (
    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <FaExclamationTriangle className="text-red-400 mr-2" />
        <span className="text-red-300 font-medium">Error: {error}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-dark text-white font-inter overflow-hidden">
      {/* Left Sidebar: Filters */}
      <div className="w-full md:w-1/4 bg-gradient-to-b from-web3-darker to-gray-900 p-6 border-b md:border-b-0 md:border-r border-web3-accent/30 overflow-y-auto h-full">
        <div className="flex items-center mb-6">
          <FaEthereum className="text-2xl text-web3-neon mr-3" />
          <h2 className="web3-title text-xl">Command Center</h2>
        </div>

        <div className="sidebar-section">
          <div className="flex items-center mb-4">
            <FaFilter className="text-web3-highlight mr-2" />
            <h3 className="web3-subtitle text-base">Categories</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('Category button clicked: all');
                setCategory('all');
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${category === 'all'
                ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white'
                : 'text-gray-300 hover:bg-web3-darker/50 hover:text-white'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">📊</span>
                <span>All</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${category === 'all'
                ? 'bg-web3-accent text-white'
                : 'bg-gray-700 text-gray-300'
                }`}>
                {messages.length}
              </span>
            </button>

            <button
              onClick={() => {
                console.log('Category button clicked: urgent');
                setCategory('urgent');
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${category === 'urgent'
                ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white'
                : 'text-gray-300 hover:bg-web3-darker/50 hover:text-white'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">🚨</span>
                <span>Urgent</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${category === 'urgent'
                ? 'bg-web3-accent text-white'
                : 'bg-gray-700 text-gray-300'
                }`}>
                {messages.filter(msg => msg.category === 'urgent').length}
              </span>
            </button>

            <button
              onClick={() => {
                console.log('Category button clicked: high');
                setCategory('high');
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${category === 'high'
                ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white'
                : 'text-gray-300 hover:bg-web3-darker/50 hover:text-white'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">⚠️</span>
                <span>High Priority</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${category === 'high'
                ? 'bg-web3-accent text-white'
                : 'bg-gray-700 text-gray-300'
                }`}>
                {messages.filter(msg => msg.category === 'high_priority').length}
              </span>
            </button>

            <button
              onClick={() => {
                console.log('Category button clicked: routine');
                setCategory('routine');
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${category === 'routine'
                ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white'
                : 'text-gray-300 hover:bg-web3-darker/50 hover:text-white'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">📋</span>
                <span>Routine</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${category === 'routine'
                ? 'bg-web3-accent text-white'
                : 'bg-gray-700 text-gray-300'
                }`}>
                {messages.filter(msg => msg.category === 'routine').length}
              </span>
            </button>

            <button
              onClick={() => {
                console.log('Category button clicked: archive');
                setCategory('archive');
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${category === 'archive'
                ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white'
                : 'text-gray-300 hover:bg-web3-darker/50 hover:text-white'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">📁</span>
                <span>Archive</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${category === 'archive'
                ? 'bg-web3-accent text-white'
                : 'bg-gray-700 text-gray-300'
                }`}>
                {messages.filter(msg => msg.category === 'archive').length}
              </span>
            </button>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="flex items-center mb-4">
            <FaShieldAlt className="text-web3-highlight mr-2" />
            <h3 className="web3-subtitle text-base">Audited Projects</h3>
          </div>
          <div className="space-y-2">
            {['none', ...auditedProjects].map(proj => (
              <button
                key={proj}
                onClick={() => setProjectFilter(proj)}
                className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${projectFilter === proj
                  ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white'
                  : 'text-gray-300 hover:bg-web3-darker/50 hover:text-white'
                  }`}
              >
                {proj}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="flex items-center mb-4">
            <FaTelegram className="text-web3-highlight mr-2" />
            <h3 className="web3-subtitle text-base">Message Sources</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                console.log('Source button clicked: all');
                setSourceFilter('all');
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${sourceFilter === 'all'
                ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white shadow-lg'
                : 'bg-web3-darker/50 border border-web3-accent/20 text-gray-300 hover:bg-web3-darker/70 hover:border-web3-accent/40'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">📊</span>
                <span className="font-medium">All Messages</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${sourceFilter === 'all'
                ? 'bg-web3-accent text-white'
                : 'bg-gray-700 text-gray-300'
                }`}>
                {messages.length}
              </span>
            </button>

            <button
              onClick={() => {
                console.log('Source button clicked: TELEGRAM');
                setSourceFilter('TELEGRAM');
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${sourceFilter === 'TELEGRAM'
                ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white shadow-lg'
                : 'bg-web3-darker/50 border border-web3-accent/20 text-gray-300 hover:bg-web3-darker/70 hover:border-web3-accent/40'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">📱</span>
                <span className="font-medium">Telegram</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${sourceFilter === 'TELEGRAM'
                ? 'bg-web3-accent text-white'
                : 'bg-gray-700 text-gray-300'
                }`}>
                {messages.filter(msg => msg.source === 'TELEGRAM').length}
              </span>
            </button>

            <button
              onClick={() => {
                console.log('Source button clicked: TWITTER');
                setSourceFilter('TWITTER');
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${sourceFilter === 'TWITTER'
                ? 'bg-gradient-to-r from-web3-accent/20 to-web3-highlight/20 border border-web3-accent/50 text-white shadow-lg'
                : 'bg-web3-darker/50 border border-web3-accent/20 text-gray-300 hover:bg-web3-darker/70 hover:border-web3-accent/40'
                }`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-lg">🐦</span>
                <span className="font-medium">Twitter</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${sourceFilter === 'TWITTER'
                ? 'bg-web3-accent text-white'
                : 'bg-gray-700 text-gray-300'
                }`}>
                {messages.filter(msg => msg.source === 'TWITTER' || msg.source === 'TWITTER_FEED').length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Messages */}
      <div className="flex-1 p-6 overflow-y-auto h-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FaRocket className="text-2xl text-web3-neon mr-3" />
            <h2 className="web3-title text-2xl">Messages</h2>
          </div>
          <div className="flex items-center space-x-4">
            {lastRefresh && (
              <span className="text-sm text-gray-400">
                Last refresh: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refreshMessages}
              disabled={loading}
              className="web3-button flex items-center"
            >
              {loading ? (
                <div className="web3-loading mr-2"></div>
              ) : (
                <FaSync className="mr-2" />
              )}
              Refresh Messages
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && <ErrorDisplay error={error} />}

        {/* Filter Status */}
        <div className="bg-gradient-to-r from-web3-darker/80 to-gray-900/80 border border-web3-accent/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-gray-300 text-sm">Showing:</span>
                <span className="text-web3-highlight font-bold text-lg">{telegramMessages.length + twitterMessages.length}</span>
                <span className="text-gray-400 text-sm">of {messages.length} messages</span>
              </div>
              {sourceFilter !== 'all' && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">Source:</span>
                  <span className="text-web3-accent font-semibold px-2 py-1 bg-web3-accent/20 rounded-md text-sm">
                    {sourceFilter === 'TELEGRAM' ? '📱 Telegram' : '🐦 Twitter'}
                  </span>
                </div>
              )}
              {category !== 'all' && (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 text-sm">Category:</span>
                  <span className="text-web3-accent font-semibold px-2 py-1 bg-web3-accent/20 rounded-md text-sm">
                    {category === 'high' ? 'High Priority' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </span>
                </div>
              )}
              {(category !== 'all' || sourceFilter !== 'all') && (
                <button
                  onClick={() => {
                    console.log('Clearing all filters');
                    setCategory('all');
                    setSourceFilter('all');
                    setProjectFilter('none');
                  }}
                  className="text-gray-400 hover:text-white text-sm underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="text-2xl">📱</span>
                  <span className="text-web3-highlight font-bold">{messages.filter(msg => msg.source === 'TELEGRAM').length}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl">🐦</span>
                  <span className="text-web3-highlight font-bold">{messages.filter(msg => msg.source === 'TWITTER' || msg.source === 'TWITTER_FEED').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Messages Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaTelegram className="text-2xl text-web3-highlight mr-3" />
            <h3 className="web3-title text-xl">Telegram: {telegramMessages.length} messages</h3>
          </div>
          <div className="space-y-4">
            {telegramMessages.map((message) => (
              <div key={message.id} className="web3-card hover:shadow-lg hover:shadow-web3-accent/20 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{getSourceIcon(message.source)}</span>
                      <span className="font-semibold text-white">{message.sender}</span>
                      <span className="text-gray-400 text-sm">{new Date(message.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{message.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {message.category && (
                      <span className={`web3-badge ${getCategoryColor(message.category)}`}>
                        {message.category}
                      </span>
                    )}
                    <select
                      value={message.category}
                      onChange={(e) => updateCategory(message.id, e.target.value)}
                      className="bg-web3-darker border border-web3-accent/30 text-white px-2 py-1 rounded-md text-sm hover:border-web3-accent/50 focus:border-web3-accent focus:outline-none transition-colors"
                    >
                      <option value="urgent">🚨 Urgent</option>
                      <option value="high_priority">⚠️ High Priority</option>
                      <option value="routine">📋 Routine</option>
                      <option value="archive">📁 Archive</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Twitter (X) Feed Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FaTwitter className="text-2xl text-web3-accent mr-3" />
            <h3 className="web3-title text-xl">Twitter (X) Feed: {twitterMessages.length} messages</h3>
          </div>
          <div className="space-y-4">
            {twitterMessages.map((message) => (
              <div key={message.id} className="web3-card hover:shadow-lg hover:shadow-web3-accent/20 transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{getSourceIcon(message.source)}</span>
                      <span className="font-semibold text-white">{message.sender}</span>
                      <span className="text-gray-400 text-sm">{new Date(message.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{message.content}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {message.category && (
                      <span className={`web3-badge ${getCategoryColor(message.category)}`}>
                        {message.category}
                      </span>
                    )}
                    <select
                      value={message.category}
                      onChange={(e) => updateCategory(message.id, e.target.value)}
                      className="bg-web3-darker border border-web3-accent/30 text-white px-2 py-1 rounded-md text-sm hover:border-web3-accent/50 focus:border-web3-accent focus:outline-none transition-colors"
                    >
                      <option value="urgent">🚨 Urgent</option>
                      <option value="high_priority">⚠️ High Priority</option>
                      <option value="routine">📋 Routine</option>
                      <option value="archive">📁 Archive</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(telegramMessages.length === 0 && twitterMessages.length === 0) && !loading && (
          <div className="text-center py-12 text-gray-400">
            <FaEthereum className="text-6xl mx-auto mb-6 text-web3-accent animate-pulse" />
            <p className="text-xl">No messages found for the selected filters</p>
            <p className="text-sm mt-2">Current filters: Category={category}, Source={sourceFilter}, Project={projectFilter}</p>
            <p className="text-sm mt-2">Total messages: {messages.length}</p>
            <button
              onClick={() => {
                console.log('Clearing filters from empty state');
                setCategory('all');
                setSourceFilter('all');
                setProjectFilter('none');
              }}
              className="mt-4 web3-button-secondary"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-gray-400">
            <div className="web3-loading mx-auto mb-6"></div>
            <p className="text-xl">Loading messages...</p>
          </div>
        )}

        {/* Project Feeds Section */}
        <div className="mt-12">
          <div className="flex items-center mb-6">
            <FaTwitter className="text-2xl text-web3-accent mr-3" />
            <h2 className="web3-title text-2xl">Project Feeds</h2>
          </div>

          {Object.entries(projectFeeds).map(([sender, tweets]) => (
            <div key={sender} className={`web3-card mb-6 ${sender === 'PashovAuditGrp' ? 'bg-gradient-to-r from-gray-800 to-web3-accent/20' : ''}`}>
              <h3 className="text-web3-accent font-bold text-lg mb-4 flex items-center">
                {sender === 'PashovAuditGrp' ? 'Pashov Audit Group' : sender}
                {sender === 'PashovAuditGrp' && <FaShieldAlt className="ml-2 text-web3-neon" />}
              </h3>
              {tweets.map((tweet, i) => (
                <div key={i} className="project-feed-card">
                  <p className="message-content text-base mb-3">{tweet.content}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {auditedProjects.map(project => (
                      tweet.content && tweet.content.includes(project) && (
                        <span key={project} className="web3-badge-highlight">
                          {project}
                        </span>
                      )
                    ))}
                  </div>
                  <span className="text-xs text-web3-highlight font-medium">
                    {new Date(tweet.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {Object.keys(projectFeeds).length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">
              <FaTwitter className="text-6xl mx-auto mb-6 text-web3-accent animate-pulse" />
              <p className="text-xl">No project feeds available</p>
              <p className="text-sm mt-2">Refresh to load the latest updates</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Templates */}
      <div className="w-full md:w-1/4 bg-gradient-to-b from-web3-darker to-gray-900 p-6 border-t md:border-t-0 md:border-l border-web3-accent/30 overflow-y-auto h-full">
        <div className="flex items-center mb-6">
          <FaCopy className="text-2xl text-web3-neon mr-3" />
          <h2 className="web3-title text-xl">Reply Templates</h2>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={templates}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {templates.map((template, index) => (
                <SortableTemplateItem
                  key={template}
                  template={template}
                  index={index}
                  onDelete={deleteTemplate}
                  onCopy={copyToClipboard}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add New Template Button */}
        <div className="template-card border-dashed border-2 border-web3-accent/50 hover:border-web3-accent transition-colors mt-4">
          <button
            onClick={() => {
              console.log('Add new template clicked');
              setShowTemplateModal(true);
            }}
            className="w-full h-full flex flex-col items-center justify-center py-6 text-web3-accent hover:text-web3-neon transition-colors"
          >
            <span className="text-2xl mb-2">+</span>
            <span className="font-medium">Add New Template</span>
            <span className="text-xs text-gray-400 mt-1">Create custom response</span>
          </button>
        </div>
      </div>
    </div>

    {/* Template Creation Modal */ }
  {
    showTemplateModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ transform: 'translateZ(0)' }}>
        <div className="bg-gradient-to-br from-web3-darker to-gray-900 border border-web3-accent/30 rounded-xl p-6 w-full max-w-md mx-4 shadow-lg" style={{ transform: 'translateZ(0)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="web3-title text-xl text-white">Create New Template</h3>
            <button
              onClick={() => {
                setShowTemplateModal(false);
                setNewTemplate('');
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Template Content
            </label>
            <textarea
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              placeholder="Enter your custom response template... Use {project} for project names"
              className="w-full h-32 bg-web3-darker border border-web3-accent/30 rounded-lg p-3 text-white placeholder-gray-400 focus:border-web3-accent focus:outline-none resize-none"
              style={{ willChange: 'auto' }}
            />
            <p className="text-xs text-gray-400 mt-2">
              💡 Tip: Use {"{project}"} to insert project names dynamically
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowTemplateModal(false);
                setNewTemplate('');
              }}
              className="flex-1 web3-button-secondary"
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              disabled={!newTemplate.trim()}
              className="flex-1 web3-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    )
  }
  </div >
  );
}

export default App;