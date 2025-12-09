import { BaseEntity } from "./common";

export interface Media {
  id: string;
  url: string;
  type: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  lastName?: string | null;
  firstName?: string | null;
  role: string;
  phone?: string | null;
  isPhoneVerified: boolean;
  updatedAt: string;
  createdAt: string;
  email: string;
  sessions: Array<{
    id: string;
    createdAt: string;
    expiresAt: string;
  }>;
}

export interface Room {
  id: string;
  logo?: (number | null) | Media;
  name: string;
  speaker: string;
  user: number | User;
  type: 'live' | 'auto';
  scheduledDate?: string | null;
  roomStarted?: boolean | null;
  videoUrl?: string | null;
  bannerUrl?: string | null;
  showBanner?: boolean | null;
  btnUrl?: string | null;
  showBtn?: boolean | null;
  showChat?: boolean | null;
  isVolumeOn?: boolean | null;
  startedAt?: string | null;
  stoppedAt?: string | null;
  description?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface Scenario {
  id: number;
  username?: string | null;
  message?: string | null;
  seconds?: number | null;
  room?: (string | null) | Room;
  updatedAt: string;
  createdAt: string;
}

export interface RoomResponse {
  docs: Room[];
  totalDocs?: number;
  limit?: number;
  offset?: number;
  totalPages?: number;
  page?: number;
  pagingCounter?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface CreateRoomData {
  title: string;
  description?: string;
}

export type UpdateRoomData = Partial<CreateRoomData>;
