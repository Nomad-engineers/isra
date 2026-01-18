import { Trash2, Ban, EyeOff, Lock, Unlock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatModerationPanelProps {
  isOpen: boolean;
  isChatLocked: boolean;
  onToggleChatLock: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onBanSelected: () => void;
  onDeleteAndBanSelected: () => void;
  onIgnoreSelected: () => void;
  showFiltered: boolean;
  onToggleShowFiltered: (checked: boolean) => void;
  showPrivateMessages: boolean;
  onToggleShowPrivateMessages: (checked: boolean) => void;
}

export function ChatModerationPanel({
  isOpen,
  isChatLocked,
  onToggleChatLock,
  selectedCount,
  onDeleteSelected,
  onBanSelected,
  onDeleteAndBanSelected,
  onIgnoreSelected,
  showFiltered,
  onToggleShowFiltered,
  showPrivateMessages,
  onToggleShowPrivateMessages,
}: ChatModerationPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 border-b border-gray-700/50 p-4 space-y-4 shadow-lg">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Модерация чата
            </h3>
          </div>
          <Button
            variant={isChatLocked ? "destructive" : "outline"}
            size="sm"
            onClick={onToggleChatLock}
            className={`gap-2 font-semibold shadow-md transition-all ${
              isChatLocked 
                ? 'bg-red-600 hover:bg-red-700 text-white border-0' 
                : 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600'
            }`}
          >
            {isChatLocked ? (
              <>
                <Lock className="h-4 w-4" />
                Разблокировать чат
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4" />
                Заблокировать чат
              </>
            )}
          </Button>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              id="show-filtered"
              checked={showFiltered}
              onChange={(e) => onToggleShowFiltered(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-gray-500 bg-gray-700 text-orange-500 focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
            />
            <span className="text-sm font-medium text-gray-200 group-hover:text-orange-400 transition-colors">
              Показывать отфильтрованные сообщения
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              id="show-private"
              checked={showPrivateMessages}
              onChange={(e) => onToggleShowPrivateMessages(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-gray-500 bg-gray-700 text-orange-500 focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
            />
            <span className="text-sm font-medium text-gray-200 group-hover:text-orange-400 transition-colors">
              Показывать личную переписку между зрителями
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50">
          <span className="text-sm font-semibold text-gray-300">
            Отмечено:
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-bold shadow-md">
            {selectedCount}
          </span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              className="gap-1.5 font-semibold shadow-md hover:shadow-lg transition-all bg-gray-600 hover:bg-gray-700 text-white border-0 disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteAndBanSelected}
              disabled={selectedCount === 0}
              className="gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold shadow-md hover:shadow-lg transition-all text-white border-0 disabled:opacity-40"
            >
              <Ban className="h-3.5 w-3.5" />
              Удалить + бан
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBanSelected}
              disabled={selectedCount === 0}
              className="gap-1.5 bg-red-950/30 border border-red-700/50 text-red-400 hover:bg-red-900/40 hover:text-red-300 font-semibold shadow-md transition-all disabled:opacity-40"
            >
              <Ban className="h-3.5 w-3.5" />
              Бан
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onIgnoreSelected}
              disabled={selectedCount === 0}
              className="gap-1.5 font-semibold shadow-md hover:shadow-lg transition-all border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 disabled:opacity-40"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Игнор.
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}