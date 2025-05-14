import { useState } from 'react';

type Thread = {
  id: string;
  openai_thread_id: string;
  title: string;
  last_message_at: string;
  active_dashboard_context?: string;
};

export default function ThreadSidebar({
  threads,
  activeThreadId,
  isOpen,
  onClose,
  onCreateNewThread,
  onSelectThread,
  onRenameThread,
  onDeleteThread,
}: {
  threads: Thread[];
  activeThreadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateNewThread: () => void;
  onSelectThread: (threadId: string) => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
  onDeleteThread: (threadId: string) => void;
}) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // Start editing a thread title
  const startEditing = (thread: Thread) => {
    setEditingThreadId(thread.id);
    setNewTitle(thread.title);
  };

  // Save the edited thread title
  const saveThreadTitle = (threadId: string) => {
    if (newTitle.trim()) {
      onRenameThread(threadId, newTitle);
    }
    setEditingThreadId(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Yesterday
    else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    // This week
    else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Older
    else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className={`w-64 bg-dark-space border-r border-stardust-silver border-opacity-20 flex flex-col h-full ${
        isOpen ? 'absolute inset-y-0 left-0 z-10 md:relative' : 'hidden md:flex'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-stardust-silver border-opacity-20 flex justify-between items-center">
        <h3 className="font-medium">Chat History</h3>
        <button
          onClick={onClose}
          className="md:hidden text-stardust-silver hover:text-starlight-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onCreateNewThread}
        className="m-3 py-2 px-3 bg-nebula-veil hover:bg-opacity-80 text-starlight-white rounded-md flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        New Chat
      </button>

      {/* Threads List */}
      <div className="flex-grow overflow-y-auto">
        {threads.length === 0 ? (
          <div className="text-stardust-silver text-sm p-4 text-center">
            No chat history yet
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {threads.map((thread) => (
              <li key={thread.id}>
                {editingThreadId === thread.id ? (
                  <div className="flex p-2">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveThreadTitle(thread.id);
                        if (e.key === 'Escape') setEditingThreadId(null);
                      }}
                      autoFocus
                      className="flex-grow bg-nebula-veil border border-stardust-silver border-opacity-30 rounded px-2 py-1 text-sm text-starlight-white"
                    />
                    <button
                      onClick={() => saveThreadTitle(thread.id)}
                      className="ml-1 text-supernova-teal"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    className={`flex items-center px-3 py-2 rounded-md cursor-pointer group ${
                      thread.openai_thread_id === activeThreadId
                        ? 'bg-nebula-veil'
                        : 'hover:bg-nebula-veil hover:bg-opacity-50'
                    }`}
                    onClick={() => onSelectThread(thread.openai_thread_id)}
                  >
                    <div className="flex-grow truncate">
                      <div className="font-medium truncate">{thread.title}</div>
                      <div className="text-xs text-stardust-silver">
                        {formatDate(thread.last_message_at)}
                        {thread.active_dashboard_context && (
                          <span className="ml-1">
                            • {thread.active_dashboard_context.split('_').join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(thread);
                        }}
                        className="text-stardust-silver hover:text-starlight-white p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this chat?')) {
                            onDeleteThread(thread.id);
                          }
                        }}
                        className="text-stardust-silver hover:text-error-red p-1"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}