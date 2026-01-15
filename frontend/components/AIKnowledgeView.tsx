// 知识库界面
import React, { useState } from 'react';
import { Search, FileText, MessageSquare, ExternalLink } from 'lucide-react';
import { AITask, KnowledgeFragment, SourceType } from '../types/ai';
import { knowledgeApi } from '../services/aiApiService';

interface AIKnowledgeViewProps {
  task: AITask;
  onBack: () => void;
}

const AIKnowledgeView: React.FC<AIKnowledgeViewProps> = ({ task, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<KnowledgeFragment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await knowledgeApi.search({
        query: searchQuery,
        taskId: task.id,
        limit: 20,
      });
      setResults(response.results);
    } catch (error) {
      console.error('Failed to search knowledge:', error);
      alert('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getSourceIcon = (sourceType: SourceType) => {
    switch (sourceType) {
      case SourceType.NOTE:
        return <FileText size={16} className="text-blue-500" />;
      case SourceType.MESSAGE:
        return <MessageSquare size={16} className="text-green-500" />;
      case SourceType.EXTERNAL:
        return <ExternalLink size={16} className="text-purple-500" />;
      default:
        return null;
    }
  };

  const getSourceLabel = (sourceType: SourceType) => {
    const labels: Record<SourceType, string> = {
      [SourceType.NOTE]: '笔记',
      [SourceType.MESSAGE]: '消息',
      [SourceType.EXTERNAL]: '外部资料',
    };
    return labels[sourceType];
  };

  return (
    <div className="space-y-4">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-boss-900">知识库</h1>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="搜索相关知识..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boss-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !searchQuery.trim()}
          className="px-6 py-3 bg-boss-900 text-white rounded-lg hover:bg-boss-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '搜索中...' : '搜索'}
        </button>
      </div>

      {/* 搜索结果 */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            找到 {results.length} 条相关结果
          </div>
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSourceIcon(result.sourceType)}
                  <span className="text-sm font-medium text-gray-700">
                    {getSourceLabel(result.sourceType)}
                  </span>
                  {result.relevanceScore && (
                    <span className="text-xs text-gray-500">
                      (相关度: {(result.relevanceScore * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-900 mb-2">{result.content}</p>
              {result.metadataJson && (
                <div className="text-xs text-gray-500">
                  {JSON.stringify(result.metadataJson)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && searchQuery && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>没有找到相关结果</p>
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-12 text-gray-500">
          <Search size={48} className="mx-auto mb-4 text-gray-400" />
          <p>输入关键词搜索知识库</p>
          <p className="text-sm mt-2">可以搜索笔记、对话消息和外部资料中的内容</p>
        </div>
      )}
    </div>
  );
};

export default AIKnowledgeView;
