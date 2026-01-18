import { Loader2, MessageSquare, Info, Sparkles } from "lucide-react";
import { ModeratedChatMessage, ChatMessage } from "./moderated-chat-message";

interface SystemMessage {
  id: string;
  type: 'system' | 'welcome' | 'info';
  message: string;
  timestamp: string;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  systemMessages: SystemMessage[];
  loadingHistory: boolean;
  isModerator: boolean;
  selectedMessages: Set<string>;
  onToggleSelect: (id: string) => void;
  onReply: (message: ChatMessage) => void;
  onDelete: (id: string) => void;
  onBan: (username: string) => void;
  onIgnore: (username: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatMessageList({
  messages,
  systemMessages,
  loadingHistory,
  isModerator,
  selectedMessages,
  onToggleSelect,
  onReply,
  onDelete,
  onBan,
  onIgnore,
  messagesEndRef,
}: ChatMessageListProps) {
  if (loadingHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-20 animate-pulse"></div>
          <Loader2 className="h-14 w-14 animate-spin text-blue-500 relative z-10" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-medium text-gray-700 dark:text-gray-200">
            Загрузка истории сообщений...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Пожалуйста, подождите
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {systemMessages.map((sysMsg) => {
        const isWelcome = sysMsg.type === 'welcome';
        return (
          <div 
            key={sysMsg.id} 
            className={`relative overflow-hidden rounded-xl p-4 space-y-2.5 shadow-sm transition-all hover:shadow-md ${
              isWelcome 
                ? 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-pink-950/40 border-2 border-blue-200/50 dark:border-blue-700/50'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-700/40'
            }`}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  isWelcome 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-blue-500'
                }`}>
                  {isWelcome ? (
                    <Sparkles className="h-4 w-4 text-white" />
                  ) : (
                    <Info className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                  {isWelcome ? 'Приветственное сообщение' : 'Системное сообщение'}
                </span>
              </div>
              
              <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line leading-relaxed mt-2 font-medium">
                {sysMsg.message}
              </p>
              
              <div className="flex items-center justify-end mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {new Date(sysMsg.timestamp).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {messages.length === 0 && systemMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-10"></div>
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-6 rounded-full">
              <MessageSquare className="h-16 w-16 text-blue-500 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Пока нет сообщений
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Будьте первым, кто напишет!
            </p>
          </div>
        </div>
      )}

      {messages.map((msg) => (
        <ModeratedChatMessage
          key={msg.id}
          message={msg}
          isModerator={isModerator}
          isSelected={selectedMessages.has(msg.id)}
          onToggleSelect={onToggleSelect}
          onReply={onReply}
          onDelete={onDelete}
          onBan={onBan}
          onIgnore={onIgnore}
        />
      ))}

      <div ref={messagesEndRef} />
    </>
  );
}