// @/types/webinar.ts

import { BaseEntity, StatusEntity } from "./common";

export type WebinarType = "live" | "auto";

export interface Webinar extends BaseEntity, StatusEntity {
  title: string;
  description?: string;
  type: WebinarType;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // в минутах
  maxParticipants?: number;
  currentParticipants?: number;
  link?: string;
  streamUrl?: string; // Stream URL for webinar access
  roomSettings?: {
    allowRecording: boolean;
    allowChat: boolean;
    allowScreenShare: boolean;
    requirePassword: boolean;
    password?: string;
  };
  hostId: string;
  hostName?: string;
  tags?: string[];
  thumbnail?: string;
  status: "draft" | "scheduled" | "active" | "ended" | "cancelled";

  // Новые поля для отображения владельца (для админской панели)
  ownerEmail?: string;
  ownerName?: string;
}

export interface CreateWebinarData {
  title: string;
  description?: string;
  type: WebinarType;
  scheduledAt?: string;
  maxParticipants?: number;
  roomSettings?: Partial<Webinar["roomSettings"]>;
  tags?: string[];
}

export interface UpdateWebinarData extends Partial<CreateWebinarData> {
  status?: Webinar["status"];
}

export interface WebinarStats {
  total: number;
  active: number;
  scheduled: number;
  drafts: number;
}
