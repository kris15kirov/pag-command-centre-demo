import React, { useState } from 'react';
import { Copy, Check, MessageSquare } from 'lucide-react';

const TemplatesPanel = ({ templates }) => {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyTemplate = async (template) => {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopiedId(template.id);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy template:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = template.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopiedId(template.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates available</h3>
          <p className="text-gray-500">Reply templates will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Reply Templates</h2>
        <span className="text-sm text-gray-500">{templates.length} templates</span>
      </div>
      
      <div className="space-y-3">
        {templates.map((template) => (
          <div key={template.id} className="card hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-medium text-gray-900 text-sm">{template.name}</h3>
              <button
                onClick={() => handleCopyTemplate(template)}
                className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 transition-colors duration-200"
                title="Copy to clipboard"
              >
                {copiedId === template.id ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed">
              {template.content}
            </p>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Click "Copy" to use this template</span>
                <span className="bg-gray-100 px-2 py-1 rounded">Template #{template.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">💡 Quick Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Copy" to copy template to clipboard</li>
          <li>• Use templates for consistent responses</li>
          <li>• Customize templates before sending</li>
          <li>• Templates work for both Telegram & Twitter</li>
        </ul>
      </div>
    </div>
  );
};

export default TemplatesPanel;
