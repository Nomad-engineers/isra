
import { useState } from "react";
import { Trash2, Ban, EyeOff, Reply, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  createdAt: string;
  role?: 'moderator' | 'admin' | 'user';
  replyTo?: {
    username: string;
    message: string;
  };
}

interface ModeratedChatMessageProps {
  message: ChatMessage;
  isModerator: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onReply: (message: ChatMessage) => void;
  onDelete: (id: string) => void;
  onBan: (username: string) => void;
  onIgnore: (username: string) => void;
}

export function ModeratedChatMessage({
  message,
  isModerator,
  isSelected,
  onToggleSelect,
  onReply,
  onDelete,
  onBan,
  onIgnore,
}: ModeratedChatMessageProps) {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'moderator':
        return (
          <Badge variant="destructive" className="text-xs">
            модератор
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="text-xs bg-red-700">
            администратор
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`space-y-1 p-2 rounded-lg transition-colors ${
        isSelected ? 'bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400' : ''
      } ${message.role === 'moderator' || message.role === 'admin' ? 'bg-red-50 dark:bg-red-950/20' : ''}`}
    >
      {message.replyTo && (
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded mb-1">
          <span className="font-semibold">→ {message.replyTo.username}</span>
          <p className="truncate">{message.replyTo.message}</p>
        </div>
      )}

      <div className="flex items-start gap-2">
        {isModerator && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(message.id)}
            className="mt-1 w-4 h-4 rounded border-gray-300 cursor-pointer"
          />
        )}

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {getRoleBadge(message.role)}
            <span className="font-semibold text-primary text-sm">
              {message.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(message.createdAt).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <p className="text-foreground text-sm bg-muted/50 rounded-lg px-3 py-2">
            {message.message}
          </p>
        </div>

        {isModerator && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply className="h-4 w-4 mr-2" />
                Ответить
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBan(message.username)} className="text-red-600">
                <Ban className="h-4 w-4 mr-2" />
                Забанить
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onIgnore(message.username)}>
                <EyeOff className="h-4 w-4 mr-2" />
                Игнорировать
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}