export interface Notification {
  id: string;
  message: string;
  leido: boolean;
  date: string;
}

export interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

export interface GetNotificationsPayload {
  id: string;
}

export interface MarkNotificationAsReadPayload {
  id: string;
  userId: string;
} 