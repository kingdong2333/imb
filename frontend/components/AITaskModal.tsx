// AI任务创建/编辑模态框
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AITask, AITaskType, CreateAITaskRequest } from '../types/ai';
import { aiTaskApi } from '../services/aiApiService';

interface AITaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: AITask) => void;
  taskToEdit?: AITask;
}

const AITaskModal: React.FC<AITaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AITaskType>(AITaskType.OTHER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setType(taskToEdit.type);
    } else {
      setTitle('');
      setDescription('');
      setType(AITaskType.OTHER);
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入任务标题');
      return;
    }

    try {
      setLoading(true);
      const data: CreateAITaskRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
      };

      const task = await aiTaskApi.createTask(data);
      onSave(task);
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('创建任务失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-boss-900">创建AI任务</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务标题 *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：投资特斯拉股票"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boss-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述你的任务需求..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boss-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              任务类型 *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AITaskType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boss-500 focus:border-transparent"
              required
            >
              <option value={AITaskType.INVESTMENT}>投资决策</option>
              <option value={AITaskType.LEARNING}>学习规划</option>
              <option value={AITaskType.WORK}>工作规划</option>
              <option value={AITaskType.OTHER}>其他</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-boss-900 text-white rounded-lg hover:bg-boss-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '创建任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AITaskModal;
