// AI助手主视图
import React, { useState, useEffect } from 'react';
import { AITask, AITaskType } from '../types/ai';
import { IEvent } from '../types';
import { aiTaskApi } from '../services/aiApiService';
import AITaskListView from './AITaskListView';
import AITaskModal from './AITaskModal';
import AIConversationView from './AIConversationView';
import AINoteView from './AINoteView';
import AIKnowledgeView from './AIKnowledgeView';

type ViewMode = 'list' | 'conversation' | 'note' | 'knowledge';

interface AIAssistantViewProps {
  targetEvent?: IEvent | null;
  onClearTarget?: () => void;
}

const AIAssistantView: React.FC<AIAssistantViewProps> = ({ targetEvent, onClearTarget }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTask, setSelectedTask] = useState<AITask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleTargetEvent = async () => {
      if (!targetEvent) return;
      
      try {
        const result = await aiTaskApi.getTasks({ eventId: targetEvent.id });
        if (result.content.length > 0) {
          handleSelectTask(result.content[0]);
        } else {
          // Create new task
          const newTask = await aiTaskApi.createTask({
             title: targetEvent.title,
             description: targetEvent.description || '',
             type: AITaskType.LEARNING,
             eventId: targetEvent.id
          });
          handleSelectTask(newTask);
        }
      } catch (error) {
        console.error("Failed to handle target event", error);
      } finally {
        if (onClearTarget) onClearTarget();
      }
    };
    
    handleTargetEvent();
  }, [targetEvent]);

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
