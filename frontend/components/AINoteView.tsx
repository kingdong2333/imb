// AI笔记查看/编辑界面
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit2, Save, X, Download, RefreshCw, Trash2, FileText } from 'lucide-react';
import { AITask, AINote } from '../types/ai';
import { noteApi } from '../services/aiApiService';
import MarkdownEditor from './MarkdownEditor';

interface AINoteViewProps {
  task: AITask;
  onBack: () => void;
}

const AINoteView: React.FC<AINoteViewProps> = ({ task, onBack }) => {
  const [notes, setNotes] = useState<AINote[]>([]);
  const [selectedNote, setSelectedNote] = useState<AINote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [task.id]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await noteApi.getNotes(task.id);
      setNotes(response.content);
      if (response.content.length > 0 && !selectedNote) {
        setSelectedNote(response.content[0]);
        setEditContent(response.content[0].content);
        setEditTitle(response.content[0].title);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNote = async () => {
    try {
      setGenerating(true);
      const newNote = await noteApi.generateNote(task.id);
      await loadNotes();
      setSelectedNote(newNote);
      setEditContent(newNote.content);
      setEditTitle(newNote.title);
    } catch (error) {
      console.error('Failed to generate note:', error);
      alert('生成笔记失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateNote = async () => {
    if (!selectedNote) return;
    
    try {
      setGenerating(true);
      const updatedNote = await noteApi.regenerateNote(task.id, selectedNote.id, true);
      await loadNotes();
      setSelectedNote(updatedNote);
      setEditContent(updatedNote.content);
      setEditTitle(updatedNote.title);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to regenerate note:', error);
      alert('重新生成笔记失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      setLoading(true);
      await noteApi.updateNote(task.id, selectedNote.id, {
        title: editTitle,
        content: editContent,
      });
      await loadNotes();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('保存笔记失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (!window.confirm('确定要删除这个笔记吗？')) return;

    try {
      await noteApi.deleteNote(task.id, selectedNote.id);
      await loadNotes();
      if (notes.length > 1) {
        const remainingNotes = notes.filter((n) => n.id !== selectedNote.id);
        setSelectedNote(remainingNotes[0] || null);
      } else {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('删除笔记失败，请重试');
    }
  };

  const handleExportNote = () => {
    if (!selectedNote) return;

    const content = `# ${selectedNote.title}\n\n${selectedNote.content}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedNote.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg border border-gray-200">
      {/* 左侧笔记列表 */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-boss-900">笔记列表</h3>
            <button
              onClick={handleGenerateNote}
              disabled={generating}
              className="p-1.5 text-boss-900 hover:bg-boss-50 rounded"
              title="生成新笔记"
            >
              <FileText size={18} />
            </button>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 返回任务
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <p className="mb-2">还没有笔记</p>
              <button
                onClick={handleGenerateNote}
                disabled={generating}
                className="text-boss-900 hover:underline"
              >
                {generating ? '生成中...' : '生成第一个笔记'}
              </button>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setEditContent(note.content);
                    setEditTitle(note.title);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedNote?.id === note.id
                      ? 'bg-boss-50 border border-boss-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm text-boss-900 mb-1 line-clamp-2">
                    {note.title}
                  </div>
                  {note.summary && (
                    <div className="text-xs text-gray-500 line-clamp-2">{note.summary}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    v{note.version} · {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧笔记内容 */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* 工具栏 */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-lg font-semibold"
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-boss-900">{selectedNote.title}</h2>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(selectedNote.content);
                        setEditTitle(selectedNote.title);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={handleSaveNote}
                      disabled={loading}
                      className="p-2 text-boss-900 hover:bg-boss-50 rounded-lg"
                    >
                      <Save size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleRegenerateNote}
                      disabled={generating}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="重新生成"
                    >
                      <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={handleExportNote}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      title="导出"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={handleDeleteNote}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-boss-900 hover:bg-boss-50 rounded-lg"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <div className="h-full">
                  <MarkdownEditor
                    value={editContent}
                    onChange={setEditContent}
                    className="h-full"
                  />
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedNote.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-4 text-gray-400" />
              <p>选择一个笔记查看，或生成新笔记</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AINoteView;
