import React, { useState, useEffect } from 'react';
import { Filter, MessageCircle, Twitter, AlertTriangle, Star, Clock, Archive, TrendingUp, Briefcase } from 'lucide-react';

const Sidebar = ({ filters, onFilterChange, stats }) => {
    const [projects, setProjects] = useState({});
    const [analytics, setAnalytics] = useState({});
    const [showAnalytics, setShowAnalytics] = useState(false);

    useEffect(() => {
        // Fetch audited projects
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => setProjects(data.projects))
            .catch(err => console.error('Error fetching projects:', err));

        // Fetch analytics
        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => setAnalytics(data))
            .catch(err => console.error('Error fetching analytics:', err));
    }, []);

    const categories = [
        { id: 'urgent', name: 'Urgent', icon: AlertTriangle, color: 'text-urgent-600', count: stats.categories?.urgent || 0 },
        { id: 'high_priority', name: 'High Priority', icon: Star, color: 'text-high-600', count: stats.categories?.high_priority || 0 },
        { id: 'routine', name: 'Routine', icon: Clock, color: 'text-blue-600', count: stats.categories?.routine || 0 },
        { id: 'archive', name: 'Archive', icon: Archive, color: 'text-gray-600', count: stats.categories?.archive || 0 },
    ];

    const sources = [
        { id: 'telegram', name: 'Telegram', icon: MessageCircle, color: 'text-blue-500', count: stats.telegram_messages || 0 },
        { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400', count: stats.twitter_messages || 0 },
    ];

    const handleCategoryFilter = (category) => {
        const newFilters = {
            ...filters,
            category: filters.category === category ? null : category
        };
        onFilterChange(newFilters);
    };

    const handleSourceFilter = (source) => {
        const newFilters = {
            ...filters,
            source: filters.source === source ? null : source
        };
        onFilterChange(newFilters);
    };

    const handleProjectFilter = (project) => {
        const newFilters = {
            ...filters,
            project: filters.project === project ? null : project
        };
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        onFilterChange({ category: null, source: null, project: null });
    };

    const hasActiveFilters = filters.category || filters.source || filters.project;

    // Flatten projects for easier rendering
    const allProjects = [];
    Object.entries(projects).forEach(([category, projectList]) => {
        projectList.forEach(project => {
            allProjects.push({ name: project, category, count: analytics.project_mentions?.[project] || 0 });
        });
    });

    return (
        <div className="space-y-6">
            {/* Statistics Card */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Messages</span>
                        <span className="font-semibold text-gray-900">{stats.total_messages || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Telegram</span>
                        <span className="font-semibold text-blue-600">{stats.telegram_messages || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Twitter</span>
                        <span className="font-semibold text-blue-400">{stats.twitter_messages || 0}</span>
                    </div>
                    {analytics.overview && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Last 24h</span>
                            <span className="font-semibold text-green-600">{analytics.overview.recent_messages_24h || 0}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Analytics Toggle */}
            <div className="card">
                <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                    <div className="flex items-center space-x-3">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="font-medium text-gray-700">Analytics</span>
                    </div>
                    <span className="text-sm text-gray-500">▶</span>
                </button>

                {showAnalytics && analytics.project_mentions && (
                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Project Mentions</h4>
                        {Object.entries(analytics.project_mentions).map(([project, count]) => (
                            <div key={project} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{project}</span>
                                <span className="font-medium text-purple-600">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category Filters */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                    <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-2">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        const isActive = filters.category === category.id;

                        return (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryFilter(category.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200 ${isActive
                                        ? 'bg-primary-50 border border-primary-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className={`h-4 w-4 ${category.color}`} />
                                    <span className={`font-medium ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>
                                        {category.name}
                                    </span>
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'
                                    }`}>
                                    {category.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Source Filters */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sources</h3>
                <div className="space-y-2">
                    {sources.map((source) => {
                        const Icon = source.icon;
                        const isActive = filters.source === source.id;

                        return (
                            <button
                                key={source.id}
                                onClick={() => handleSourceFilter(source.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors duration-200 ${isActive
                                        ? 'bg-primary-50 border border-primary-200'
                                        : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon className={`h-4 w-4 ${source.color}`} />
                                    <span className={`font-medium ${isActive ? 'text-primary-700' : 'text-gray-700'}`}>
                                        {source.name}
                                    </span>
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'
                                    }`}>
                                    {source.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Web3 Project Filters */}
            {allProjects.length > 0 && (
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Audited Projects</h3>
                        <Briefcase className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {allProjects.map((project) => {
                            const isActive = filters.project === project.name;

                            return (
                                <button
                                    key={project.name}
                                    onClick={() => handleProjectFilter(project.name)}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors duration-200 text-sm ${isActive
                                            ? 'bg-purple-50 border border-purple-200'
                                            : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    <span className={`font-medium ${isActive ? 'text-purple-700' : 'text-gray-700'}`}>
                                        {project.name}
                                    </span>
                                    {project.count > 0 && (
                                        <span className={`text-xs font-medium ${isActive ? 'text-purple-600' : 'text-gray-500'
                                            }`}>
                                            {project.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
                <div className="card">
                    <button
                        onClick={clearFilters}
                        className="w-full btn-secondary"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
