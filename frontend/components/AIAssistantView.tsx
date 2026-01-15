// AI助手主视图
import React, { useState } from 'react';
import { AITask } from '../types/ai';
import AITaskListView from './AITaskListView';
import AITaskModal from './AITaskModal';
import AIConversationView from './AIConversationView';
import AINoteView from './AINoteView';
import AIKnowledgeView from './AIKnowledgeView';

type ViewMode = 'list' | 'conversation' | 'note' | 'knowledge';

const AIAssistantView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectTask = (task: AITask) => {
    setSelectedTask(task);
    setViewMode('conversation');
  };

  const handleCreateTask = () => {
    setIsModalOpen(true);
  };

  const handleSaveTask = (task: AITask) => {
    setSelectedTask(task);
    setViewMode('conversation');
    setIsModalOpen(false);
  };

  const handleBackToList = () => {
    setSelectedTask(null);
    setViewMode('list');
  };

  const handleGenerateNote = () => {
    setViewMode('note');
  };

  return (
    <div className="space-y-4">
      {viewMode === 'list' && (
        <>
          <AITaskListView
            onSelectTask={handleSelectTask}
            onCreateTask={handleCreateTask}
          />
          <AITaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveTask}
          />
        </>
      )}

      {viewMode === 'conversation' && selectedTask && (
        <AIConversationView
          task={selectedTask}
          onBack={handleBackToList}
          onGenerateNote={handleGenerateNote}
        />
      )}

      {viewMode === 'note' && selectedTask && (
        <AINoteView
          task={selectedTask}
          onBack={() => setViewMode('conversation')}
        />
      )}

      {viewMode === 'knowledge' && selectedTask && (
        <AIKnowledgeView
          task={selectedTask}
          onBack={() => setViewMode('conversation')}
        />
      )}
    </div>
  );
};

export default AIAssistantView;
