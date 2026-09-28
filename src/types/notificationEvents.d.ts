export interface NotificationEventDetail {
  _id?: string;
  message?: string;
  type?: string;
}

declare global {
  interface WindowEventMap {
    "notification:new": CustomEvent<NotificationEventDetail>;
    "notification:read": CustomEvent<NotificationEventDetail>;
  }
}
