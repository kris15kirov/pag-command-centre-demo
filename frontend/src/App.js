import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEthereum, FaTelegram, FaTwitter, FaCopy, FaSync } from 'react-icons/fa';

function App() {
  const [messages, setMessages] = useState([]);
  const [projectFeeds, setProjectFeeds] = useState({});
  const [category, setCategory] = useState('all');
  const [projectFilter, setProjectFilter] = useState('none');
  const [loading, setLoading] = useState(false);

  const templates = [
    "Thanks for your audit request! Pashov Audit Group (trusted by Uniswap and Aave) will review your {project} and respond soon.",
    "Can you share more details about your {project} smart contract? We've audited similar protocols like Sushi and Ethena.",
    "Interested in LayerZero integration? Pashov Audit Group has audited their cross-chain contracts.",
    "For NFT projects like Blueberry Protocol, audited by us, please provide your contract address.",
    "We're excited to support Arbitrum builders—contact us for an audit!"
  ];

  useEffect(() => {
    fetchMessages();
    fetchProjectFeeds();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/messages');
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, newCategory) => {
    try {
      await axios.post(`http://localhost:8000/api/messages/${id}/category`, {
        category: newCategory
      });
      setMessages(messages.map(msg =>
        msg.id === id ? { ...msg, category: newCategory } : msg
      ));
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const fetchProjectFeeds = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/project-feeds');
      setProjectFeeds(response.data);
    } catch (error) {
      console.error('Error fetching project feeds:', error);
    }
  };

  const refreshMessages = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:8000/api/refresh');
      await axios.post('http://localhost:8000/api/refresh-feeds');
      await fetchMessages();
      await fetchProjectFeeds();
    } catch (error) {
      console.error('Error refreshing messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getCategoryBadgeClass = (cat) => {
    switch (cat) {
      case 'urgent': return 'web3-badge-urgent';
      case 'high':
      case 'high_priority': return 'web3-badge-high';
      case 'routine': return 'web3-badge-routine';
      default: return 'web3-badge';
    }
  };

  const getSourceIcon = (source) => {
    return source === 'telegram' ? <FaTelegram className="inline text-web3-highlight" /> : <FaTwitter className="inline text-web3-accent" />;
  };

  const filteredMessages = messages.filter(msg => {
    const categoryMatch = category === 'all' || msg.category === category || (category === 'high' && msg.category === 'high_priority');
    const projectMatch = projectFilter === 'none' ||
      ['Uniswap', 'Aave', 'LayerZero', 'Ethena', 'Sushi'].some(project =>
        msg.content && msg.content.includes(project) && projectFilter === project
      );
    return categoryMatch && projectMatch;
  });

  const auditedProjects = ['Uniswap', 'Aave', 'LayerZero', 'Ethena', 'Sushi', 'Arbitrum', 'Blueberry'];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-dark text-white font-inter">
      {/* Left Sidebar: Filters */}
      <div className="w-full md:w-1/5 bg-web3-darker p-4 border-b md:border-b-0 md:border-r border-web3-accent">
        <h2 className="text-lg font-bold text-web3-neon mb-4 flex items-center">
          <FaEthereum className="mr-2" />
          Filters
        </h2>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-web3-highlight mb-2">Categories</h3>
          {['all', 'urgent', 'high', 'routine', 'archive'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`block w-full text-left p-2 mb-1 rounded-md transition-all duration-200 ${category === cat
                ? 'bg-gradient-to-r from-web3-accent to-web3-highlight text-white'
                : 'hover:bg-web3-accent hover:text-white'
                }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-web3-highlight mb-2">Audited Projects</h3>
          {['none', ...auditedProjects].map(proj => (
            <button
              key={proj}
              onClick={() => setProjectFilter(proj)}
              className={`block w-full text-left p-2 mb-1 rounded-md transition-all duration-200 ${projectFilter === proj
                ? 'bg-gradient-to-r from-web3-accent to-web3-highlight text-white'
                : 'hover:bg-web3-accent hover:text-white'
                }`}
            >
              {proj}
            </button>
          ))}
        </div>
      </div>

      {/* Main View: Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-web3-neon flex items-center">
            <FaEthereum className="mr-2" />
            Messages
          </h2>
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

        <div className="space-y-4">
          {filteredMessages.map(msg => (
            <div
              key={msg.id}
              className={`web3-card message-fade-in ${auditedProjects.some(project => msg.content && msg.content.includes(project))
                ? 'web3-highlighted'
                : ''
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {getSourceIcon(msg.source)}
                  <span className="font-semibold text-web3-highlight">{msg.sender}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={msg.category}
                    onChange={(e) => updateCategory(msg.id, e.target.value)}
                    className="web3-select text-xs"
                  >
                    {['urgent', 'high', 'routine', 'archive'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-gray-200 mb-2">{msg.content}</p>

              <div className="flex flex-wrap gap-1">
                {auditedProjects.map(project => (
                  msg.content && msg.content.includes(project) && (
                    <span key={project} className="web3-badge">
                      {project}
                    </span>
                  )
                ))}
                <span className={getCategoryBadgeClass(msg.category)}>
                  {msg.category}
                </span>
              </div>
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FaEthereum className="text-4xl mx-auto mb-4 text-web3-accent" />
              <p>No messages found for the selected filters</p>
            </div>
          )}
        </div>

        {/* Project Feeds Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-web3-neon flex items-center mb-4">
            <FaEthereum className="mr-2" />
            Project Feeds
          </h2>
          
          {Object.entries(projectFeeds).map(([sender, tweets]) => (
            <div key={sender} className={`web3-card mb-4 ${sender === 'PashovAuditGrp' ? 'bg-gradient-to-r from-gray-800 to-web3-accent' : ''}`}>
              <h3 className="text-web3-accent font-semibold mb-2">
                {sender === 'PashovAuditGrp' ? 'Pashov Audit Group' : sender}
              </h3>
              {tweets.map((tweet, i) => (
                <div key={i} className="mb-3 p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-200 mb-2">{tweet.content}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {auditedProjects.map(project => (
                      tweet.content && tweet.content.includes(project) && (
                        <span key={project} className="web3-badge-highlight">
                          {project}
                        </span>
                      )
                    ))}
                  </div>
                  <span className="text-xs text-web3-highlight">
                    {new Date(tweet.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ))}
          
          {Object.keys(projectFeeds).length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <FaEthereum className="text-4xl mx-auto mb-4 text-web3-accent" />
              <p>No project feeds available</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Templates */}
      <div className="w-full md:w-1/5 bg-web3-darker p-4 border-t md:border-t-0 md:border-l border-web3-accent">
        <h2 className="text-lg font-bold text-web3-neon mb-4 flex items-center">
          <FaEthereum className="mr-2" />
          Reply Templates
        </h2>

        <div className="space-y-3">
          {templates.map((template, i) => (
            <div key={i} className="web3-card">
              <p className="text-sm text-gray-200 mb-2">{template}</p>
              <button
                onClick={() => copyToClipboard(template)}
                className="web3-button-secondary flex items-center text-xs"
              >
                <FaCopy className="mr-1" />
                Copy
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
