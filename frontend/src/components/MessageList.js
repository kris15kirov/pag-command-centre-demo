import React from 'react';
import { MessageCircle, Twitter, Clock, User, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MessageList = ({ messages, onCategoryUpdate }) => {
    const getSourceIcon = (source) => {
        switch (source) {
            case 'telegram':
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case 'twitter':
                return <Twitter className="h-4 w-4 text-blue-400" />;
            default:
                return <MessageCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getCategoryBadge = (category) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

        switch (category) {
            case 'urgent':
                return <span className={`${baseClasses} bg-urgent-100 text-urgent-800`}>Urgent</span>;
            case 'high_priority':
                return <span className={`${baseClasses} bg-high-100 text-high-800`}>High Priority</span>;
            case 'routine':
                return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Routine</span>;
            case 'archive':
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Archive</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'urgent':
                return 'border-l-urgent-500';
            case 'high_priority':
                return 'border-l-high-500';
            case 'routine':
                return 'border-l-blue-500';
            case 'archive':
                return 'border-l-gray-500';
            default:
                return 'border-l-gray-300';
        }
    };

    // Web3 audited projects for highlighting
    const auditedProjects = [
        'Uniswap', 'Aave', 'Sushi', 'LayerZero', 'Ethena', 'Karak', 'Sofamon',
        'Compound', 'MakerDAO', 'PancakeSwap', 'dYdX', 'Curve', 'Balancer',
        'Polygon', 'Arbitrum', 'Optimism', 'Chainlink', 'The Graph', 'Filecoin'
    ];

    const getMentionedProjects = (content) => {
        return auditedProjects.filter(project =>
            content.toLowerCase().includes(project.toLowerCase())
        );
    };

    const hasProjectMentions = (content) => {
        return getMentionedProjects(content).length > 0;
    };

    const getProjectBadges = (content) => {
        const projects = getMentionedProjects(content);
        return projects.map(project => (
            <span
                key={project}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-1"
            >
                <Star className="h-3 w-3 mr-1" />
                {project}
            </span>
        ));
    };

    const handleCategoryChange = (messageId, newCategory) => {
        onCategoryUpdate(messageId, newCategory);
    };

    if (messages.length === 0) {
        return (
            <div className="card">
                <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                    <p className="text-gray-500">Try adjusting your filters or refresh to fetch new messages.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                <span className="text-sm text-gray-500">{messages.length} messages</span>
            </div>

            <div className="space-y-3">
                {messages.map((message) => {
                    const mentionedProjects = getMentionedProjects(message.content);
                    const hasProjects = mentionedProjects.length > 0;

                    return (
                        <div
                            key={message.id}
                            className={`card border-l-4 ${getCategoryColor(message.category)} hover:shadow-md transition-shadow duration-200 ${hasProjects ? 'bg-purple-50 border-purple-200' : ''
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                {/* Source Icon */}
                                <div className="flex-shrink-0 mt-1">
                                    {getSourceIcon(message.source)}
                                </div>

                                {/* Message Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span className="font-medium text-gray-900 truncate">
                                                {message.sender}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                                        {message.content}
                                    </p>

                                    {/* Project Badges */}
                                    {hasProjects && (
                                        <div className="mb-3">
                                            <div className="flex flex-wrap gap-1">
                                                {getProjectBadges(message.content)}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {getCategoryBadge(message.category)}
                                            <span className="text-xs text-gray-500 capitalize">
                                                via {message.source}
                                            </span>
                                        </div>

                                        {/* Category Dropdown */}
                                        <select
                                            value={message.category}
                                            onChange={(e) => handleCategoryChange(message.id, e.target.value)}
                                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="urgent">Urgent</option>
                                            <option value="high_priority">High Priority</option>
                                            <option value="routine">Routine</option>
                                            <option value="archive">Archive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MessageList;
