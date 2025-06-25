import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "./notifications.thunks";
import {
  setNotifications,
  addNotification,
  markNotificationAsReadLocal,
  markAllNotificationsAsRead,
  clearNotifications,
  setLoading,
  setError,
} from "./notifications.slice";
import type {
  GetNotificationsPayload,
  MarkNotificationAsReadPayload,
  Notification,
} from "./notifications.types";

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, error } = useAppSelector(
    (state) => state.notifications
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.leido
  ).length;

  const getNotifications = useCallback(
    (payload: GetNotificationsPayload) => {
      dispatch(fetchNotifications(payload));
    },
    [dispatch]
  );

  const markNotificationAsReadAction = useCallback(
    (payload: MarkNotificationAsReadPayload) => {
      dispatch(markNotificationAsRead(payload));
    },
    [dispatch]
  );

  const setNotificationsAction = useCallback(
    (notifications: Notification[]) => {
      dispatch(setNotifications(notifications));
    },
    [dispatch]
  );

  const addNotificationAction = useCallback(
    (notification: Notification) => {
      dispatch(addNotification(notification));
    },
    [dispatch]
  );

  const markNotificationAsReadLocalAction = useCallback(
    (id: string) => {
      dispatch(markNotificationAsReadLocal(id));
    },
    [dispatch]
  );

  const markAllNotificationsAsReadAction = useCallback(() => {
    dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  const clearNotificationsAction = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const setLoadingAction = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch]
  );

  const setErrorAction = useCallback(
    (error: string | null) => {
      dispatch(setError(error));
    },
    [dispatch]
  );

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    getNotifications,
    markNotificationAsRead: markNotificationAsReadAction,
    setNotifications: setNotificationsAction,
    addNotification: addNotificationAction,
    markNotificationAsReadLocal: markNotificationAsReadLocalAction,
    markAllNotificationsAsRead: markAllNotificationsAsReadAction,
    clearNotifications: clearNotificationsAction,
    setLoading: setLoadingAction,
    setError: setErrorAction,
  };
};
