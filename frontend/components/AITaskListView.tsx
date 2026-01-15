// AI任务列表视图
import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, FileText, Archive, Trash2, Sparkles } from 'lucide-react';
import { AITask, AITaskType, AITaskStatus } from '../types/ai';
import { aiTaskApi } from '../services/aiApiService';

interface AITaskListViewProps {
  onSelectTask: (task: AITask) => void;
  onCreateTask: () => void;
}

const AITaskListView: React.FC<AITaskListViewProps> = ({ onSelectTask, onCreateTask }) => {
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AITaskStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<AITaskType | 'ALL'>('ALL');

  useEffect(() => {
    loadTasks();
  }, [filterStatus, filterType]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterType !== 'ALL') params.type = filterType;
      
      const response = await aiTaskApi.getTasks(params);
      setTasks(response.content);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        await aiTaskApi.deleteTask(taskId);
        loadTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('删除失败，请重试');
      }
    }
  };

  const handleArchiveTask = async (taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiTaskApi.updateTaskStatus(taskId, AITaskStatus.ARCHIVED);
      loadTasks();
    } catch (error) {
      console.error('Failed to archive task:', error);
    }
  };

  const getTypeLabel = (type: AITaskType) => {
    const labels: Record<AITaskType, string> = {
      [AITaskType.INVESTMENT]: '投资',
      [AITaskType.LEARNING]: '学习',
      [AITaskType.WORK]: '工作',
      [AITaskType.OTHER]: '其他',
    };
    return labels[type];
  };

  const getStatusColor = (status: AITaskStatus) => {
    const colors: Record<AITaskStatus, string> = {
      [AITaskStatus.ACTIVE]: 'bg-blue-100 text-blue-800',
      [AITaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [AITaskStatus.ARCHIVED]: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-boss-900">AI 助手任务</h1>
        <button
          onClick={onCreateTask}
          className="flex items-center gap-2 px-4 py-2 bg-boss-900 text-white rounded-lg hover:bg-boss-800 transition-colors"
        >
          <Plus size={20} />
          <span>新建任务</span>
        </button>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as AITaskStatus | 'ALL')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="ALL">全部状态</option>
          <option value={AITaskStatus.ACTIVE}>进行中</option>
          <option value={AITaskStatus.COMPLETED}>已完成</option>
          <option value={AITaskStatus.ARCHIVED}>已归档</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as AITaskType | 'ALL')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="ALL">全部类型</option>
          <option value={AITaskType.INVESTMENT}>投资</option>
          <option value={AITaskType.LEARNING}>学习</option>
          <option value={AITaskType.WORK}>工作</option>
          <option value={AITaskType.OTHER}>其他</option>
        </select>
      </div>

      {/* 任务列表 */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-400" />
          <p>还没有AI任务，创建一个开始吧！</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task)}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-boss-900 flex-1">{task.title}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => handleArchiveTask(task.id, e)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="归档"
                  >
                    <Archive size={16} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
              )}
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status === AITaskStatus.ACTIVE ? '进行中' : 
                   task.status === AITaskStatus.COMPLETED ? '已完成' : '已归档'}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {getTypeLabel(task.type)}
                </span>
              </div>
              
              <div className="mt-3 text-xs text-gray-400">
                创建于 {new Date(task.createdAt).toLocaleDateString('zh-CN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AITaskListView;
